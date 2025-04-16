
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      destination, 
      startDate, 
      endDate, 
      budget, 
      groupSize, 
      preferences, 
      accommodation, 
      notes 
    } = await req.json();
    
    if (!destination || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: "Missing required trip details" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    console.log(`Planning a ${durationInDays}-day trip to ${destination}`);

    // Format dates for the prompt
    const formatDateForDisplay = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    };

    // Create dates array for each day of the trip
    const tripDates = [];
    for (let i = 0; i < durationInDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      tripDates.push(formatDateForDisplay(currentDate));
    }

    // Build the personalized prompt template
    const promptTemplate = `
You are a travel planning expert. Generate a personalized day-by-day itinerary with activities for Morning, Afternoon, and Evening. Customize based on the given details.

Respond ONLY with the formatted itinerary.

---

Destination: ${destination}
Start Date: ${formatDateForDisplay(start)}
End Date: ${formatDateForDisplay(end)}
Total Budget (per person): $${budget}
Group Size: ${groupSize}
Accommodation: ${accommodation}
Preferences: ${preferences.join(', ')}
Additional Notes: ${notes || 'None provided'}

---

Format the output like this:

Trip Highlights:
- [5 short bullet points about the overall trip experience]

Generated Itinerary:

${tripDates.map((date, index) => `
Day ${index + 1} – ${date}
Morning: [Title] – [Brief description] – [$amount] – [Category: e.g., Sightseeing]
Afternoon: [Title] – [Brief description] – [$amount] – [Category]
Evening: [Title] – [Brief description] – [$amount] – [Category]
`).join('\n')}

Ensure all activities align with the preferences and budget provided. Balance between tourist attractions and authentic local experiences.
`;

    console.log("Sending request to Gemini API");
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: promptTemplate }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    });

    const data = await response.json();
    console.log("Received response from Gemini API");
    
    // Extract the text response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log("Generated text length:", generatedText.length);
    
    // Parse the generated text into a structured itinerary
    const parsedItinerary = parseGeneratedItinerary(generatedText, destination, start, end, durationInDays);
    console.log(`Successfully parsed itinerary with ${parsedItinerary.days.length} days`);
    
    return new Response(JSON.stringify(parsedItinerary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in generate-itinerary function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to parse the generated text into a structured itinerary object
function parseGeneratedItinerary(
  text: string, 
  destination: string, 
  startDate: Date, 
  endDate: Date, 
  durationInDays: number
): any {
  console.log("Parsing itinerary text...");
  
  // Extract highlights
  const highlightsMatch = text.match(/Trip Highlights:\s*\n((?:-\s*.*\s*\n)+)/i);
  const highlightsText = highlightsMatch ? highlightsMatch[1] : '';
  const highlights = highlightsText
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().replace(/^-\s*/, '').trim())
    .filter(highlight => highlight.length > 0);
    
  console.log(`Found ${highlights.length} highlights`);

  // Extract and structure days
  const days = [];
  
  for (let i = 0; i < durationInDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dayNumber = i + 1;
    const dayRegex = new RegExp(`Day ${dayNumber}[^\\n]*\\n(.*?)(?=\\n\\s*Day|$)`, 'si');
    const dayMatch = text.match(dayRegex);
    
    if (!dayMatch) {
      console.log(`Could not find match for Day ${dayNumber}`);
      // Create a fallback day if not found
      days.push(createFallbackDay(dayNumber, currentDate, destination));
      continue;
    }
    
    const dayContent = dayMatch[1];
    console.log(`Processing Day ${dayNumber} content`);
    
    // Extract activities for the day
    const activities = [];
    
    // Match Morning, Afternoon, and Evening activities
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];
    
    for (const timeSlot of timeSlots) {
      const activityRegex = new RegExp(`${timeSlot}:\\s*([^–]+)–\\s*([^–]+)–\\s*\\$([\\d]+)\\s*–\\s*([^\\n]+)`, 'i');
      const activityMatch = dayContent.match(activityRegex);
      
      if (activityMatch) {
        const [_, title, description, cost, type] = activityMatch;
        activities.push({
          time: timeSlot,
          name: title.trim(),
          description: description.trim(),
          type: type.trim(),
          cost: parseInt(cost.trim(), 10) || 0
        });
      } else {
        console.log(`Could not parse ${timeSlot} activity for Day ${dayNumber}, creating fallback`);
        // Add a fallback activity
        activities.push({
          time: timeSlot,
          name: `${destination} ${timeSlot} Activity`,
          description: `Enjoy ${timeSlot.toLowerCase()} activities in ${destination}`,
          type: "Sightseeing",
          cost: Math.round((30 + (dayNumber * 5)) * (timeSlot === 'Evening' ? 1.5 : 1))
        });
      }
    }
    
    // Add the structured day
    days.push({
      day: dayNumber,
      date: currentDate,
      activities: activities,
      weather: {
        condition: "Sunny",  // Default weather condition
        temperature: 75 // Default temperature
      }
    });
  }
  
  // Create and return the full itinerary structure
  return {
    destination,
    summary: `Your ${durationInDays}-day adventure in ${destination}`,
    highlights: highlights.length > 0 ? highlights : [
      `Experience the best of ${destination}`,
      "Visit iconic landmarks",
      "Enjoy local cuisine",
      "Immerse in local culture",
      "Create unforgettable memories"
    ],
    dates: {
      start: startDate,
      end: endDate
    },
    days
  };
}

// Create a fallback day with default activities
function createFallbackDay(dayNumber: number, date: Date, destination: string) {
  return {
    day: dayNumber,
    date: date,
    activities: [
      {
        time: "Morning",
        name: `Explore ${destination} - Day ${dayNumber} Morning`,
        description: "Start your day with a local breakfast and explore nearby attractions.",
        type: "Sightseeing",
        cost: 40 + (dayNumber * 5)
      },
      {
        time: "Afternoon",
        name: `${destination} Experience - Day ${dayNumber} Afternoon`,
        description: "Enjoy local cuisine and visit popular landmarks.",
        type: "Cultural",
        cost: 50 + (dayNumber * 5)
      },
      {
        time: "Evening",
        name: `${destination} Night - Day ${dayNumber} Evening`,
        description: "Experience the nightlife and local entertainment options.",
        type: "Entertainment",
        cost: 70 + (dayNumber * 5)
      }
    ],
    weather: {
      condition: "Sunny",
      temperature: 75
    }
  };
}

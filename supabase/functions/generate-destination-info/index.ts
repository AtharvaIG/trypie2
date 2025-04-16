
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
    const { destination } = await req.json();
    
    if (!destination) {
      return new Response(
        JSON.stringify({ error: "Missing destination parameter" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating information about ${destination}`);

    const prompt = `
      Provide detailed and inspiring information about ${destination} as a travel destination.
      
      Format your response with these clear sections:
      
      1. Description: A detailed paragraph about what makes ${destination} special, focusing on its atmosphere, unique attractions, and cultural significance.
      
      2. Highlights: List 5-8 must-see attractions or experiences in ${destination}, with a brief description for each one.
      
      3. Best Time to Visit: Information about the optimal seasons to visit ${destination} and why these times are recommended.
      
      4. Local Cuisine: Describe 3-5 local dishes or food experiences that visitors should try, with details about what makes them special.
      
      5. Travel Tips: Provide 4-6 practical recommendations for visitors (transportation, etiquette, packing advice, etc.)
      
      Make the information accurate, engaging, and useful for someone planning a trip to ${destination}.
      
      Format your output as JSON with these keys:
      {
        "name": "Full name of the destination",
        "description": "Your detailed description paragraph",
        "highlights": [
          {"name": "Highlight 1 Name", "description": "Brief description"},
          {"name": "Highlight 2 Name", "description": "Brief description"},
          ...
        ],
        "bestTimeToVisit": "Your season recommendations",
        "localCuisine": [
          {"dish": "Dish name 1", "description": "Brief description"},
          {"dish": "Dish name 2", "description": "Brief description"},
          ...
        ],
        "travelTips": [
          "Tip 1",
          "Tip 2",
          ...
        ],
        "images": ["image1.jpg", "image2.jpg"]
      }
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseFormat: 'JSON'
        }
      })
    });

    const data = await response.json();
    console.log("Received response from Gemini API");
    
    // Extract and parse the JSON response
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean and parse the JSON
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                      generatedText.match(/```\n([\s\S]*?)\n```/) || 
                      [null, generatedText];
    
    let parsedJson = jsonMatch[1];
    
    // Further cleaning of potential invalid characters
    parsedJson = parsedJson.replace(/^\s*```.*\n/, '').replace(/\n\s*```\s*$/, '');
    
    let destinationData;
    try {
      destinationData = JSON.parse(parsedJson);
      
      // Add placeholder images if not provided
      if (!destinationData.images || !Array.isArray(destinationData.images) || destinationData.images.length === 0) {
        destinationData.images = [
          `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},landmark`,
          `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},travel`,
          `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},tourism`
        ];
      }
      
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      
      // Fallback structure
      destinationData = {
        name: destination,
        description: `Discover the wonders of ${destination}. This vibrant destination offers a mix of culture, adventure, and relaxation for every type of traveler.`,
        highlights: [
          {name: "Local attractions", description: "Experience the best sights this destination has to offer."},
          {name: "Cultural experiences", description: "Immerse yourself in the local culture and traditions."},
          {name: "Natural beauty", description: "Explore the stunning landscapes and natural wonders."},
          {name: "Historical sites", description: "Discover the rich history and heritage of the region."},
          {name: "Local markets", description: "Shop for souvenirs and taste local delicacies."}
        ],
        bestTimeToVisit: "Year-round, depending on your preferences for weather and crowds.",
        localCuisine: [
          {dish: "Local specialties", description: "Try the signature dishes of the region."},
          {dish: "Traditional dishes", description: "Experience authentic flavors passed down through generations."},
          {dish: "Street food", description: "Sample affordable and delicious local street food options."}
        ],
        travelTips: [
          "Research local customs before visiting",
          "Try the local cuisine",
          "Learn a few phrases in the local language",
          "Respect cultural norms and traditions"
        ],
        images: [
          `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},landmark`,
          `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},travel`,
          `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},tourism`
        ]
      };
    }

    return new Response(JSON.stringify(destinationData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in generate-destination-info function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

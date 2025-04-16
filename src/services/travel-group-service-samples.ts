
import { TravelGroup } from "@/types/travel-group-types";

// Sample influencer trips data
export const sampleInfluencerTrips: TravelGroup[] = [
  {
    id: "sample-influencer-1",
    title: "Rajasthan Heritage Tour",
    destination: "Jaipur, Udaipur & Jaisalmer, India",
    description: "Join travel photographer @IndiaLens for a 10-day adventure capturing Rajasthan's magnificent palaces, vibrant markets, and desert landscapes. Perfect for photography enthusiasts of all levels. Includes exclusive sunrise access to forts and personalized editing workshops.",
    start_date: "2025-10-15",
    end_date: "2025-10-25",
    capacity: 12,
    memberCount: 4,
    is_influencer_trip: true,
    is_public: true,
    creator_id: "sample-creator",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator",
      fullName: "India Lens",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      email: "indialens@example.com",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: "sample-influencer-2",
    title: "Kerala Backwaters Cruise",
    destination: "Kochi & Alleppey, India",
    description: "Float through the serene backwaters of Kerala with influencer @IndianEscape. Experience 7 days of houseboat living, ayurvedic treatments, and unforgettable sunsets. All-inclusive package with luxury accommodation and curated cultural experiences at each stop.",
    start_date: "2025-01-10",
    end_date: "2025-01-17",
    capacity: 15,
    memberCount: 8,
    is_influencer_trip: true,
    is_public: true,
    creator_id: "sample-creator-2",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator-2",
      fullName: "Indian Escape",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      email: "indianescape@example.com",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: "sample-influencer-3",
    title: "Himalayan Mountain Trek",
    destination: "Manali & Ladakh, India",
    description: "Experience the magic of the Himalayas with trekking expert @MountainTales. This 12-day guided tour includes traditional homestays, hidden mountain trails, and exclusive access to remote villages normally closed to tourists.",
    start_date: "2025-05-25",
    end_date: "2025-06-05",
    capacity: 10,
    memberCount: 6,
    is_influencer_trip: true,
    is_public: true,
    creator_id: "sample-creator-3",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1587922546925-ab57ef2aa006?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator-3",
      fullName: "Mountain Tales",
      avatarUrl: "https://randomuser.me/api/portraits/women/63.jpg",
      email: "mountaintales@example.com",
      createdAt: new Date().toISOString()
    }
  }
];

// Sample explore groups data
export const sampleExploreGroups: TravelGroup[] = [
  {
    id: "sample-explore-1",
    title: "Golden Triangle Adventure",
    destination: "Delhi, Agra & Jaipur, India",
    description: "Join our small group exploring India's iconic Golden Triangle! We'll visit the magnificent Taj Mahal, explore ancient forts, and experience vibrant markets. Looking for culture enthusiasts with a sense of adventure.",
    start_date: "2025-09-10",
    end_date: "2025-09-20",
    capacity: 8,
    memberCount: 3,
    is_influencer_trip: false,
    is_public: true,
    creator_id: "sample-creator-4",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator-4",
      fullName: "Travel India",
      avatarUrl: "https://randomuser.me/api/portraits/women/22.jpg",
      email: "travelindia@example.com",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: "sample-explore-2",
    title: "South Indian Culinary Tour",
    destination: "Chennai, Madurai & Pondicherry, India",
    description: "Calling all foodies! Join us for a 10-day culinary journey through South India. We'll explore bustling street food markets, take cooking classes, and taste our way through the diverse regional cuisines of Tamil Nadu.",
    start_date: "2025-11-05",
    end_date: "2025-11-15",
    capacity: 6,
    memberCount: 2,
    is_influencer_trip: false,
    is_public: true,
    creator_id: "sample-creator-5",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1589778655375-3c31f9a5dc33?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator-5",
      fullName: "South Indian Foodie",
      avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
      email: "southindianfoodie@example.com",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: "sample-explore-3",
    title: "Goa Beach Retreat",
    destination: "North & South Goa, India",
    description: "Experience Goa's incredible beaches and Portuguese heritage on this relaxing tour. We'll visit pristine beaches, historic churches, and vibrant markets while staying in beachfront accommodations. Perfect for beach lovers and cultural explorers.",
    start_date: "2025-12-01",
    end_date: "2025-12-12",
    capacity: 10,
    memberCount: 5,
    is_influencer_trip: false,
    is_public: true,
    creator_id: "sample-creator-6",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator-6",
      fullName: "Goa Explorers",
      avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg",
      email: "goaexplorers@example.com",
      createdAt: new Date().toISOString()
    }
  }
];

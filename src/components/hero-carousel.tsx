
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Snowflake, Waves, Ship, Mountain } from "lucide-react";
import { useEffect, useState } from "react";

const carouselImages = [
  {
    src: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80",
    alt: "Snow sports with skier on mountain",
    icon: <Snowflake className="h-6 w-6" />,
    title: "Winter Adventures",
    description: "Experience the thrill of mountain skiing"
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80",
    alt: "Beautiful tropical beach with palm trees",
    icon: <Waves className="h-6 w-6" />,
    title: "Beach Getaways",
    description: "Relax on pristine sandy beaches"
  },
  {
    src: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&q=80",
    alt: "Luxury yacht sailing on open water",
    icon: <Ship className="h-6 w-6" />,
    title: "Yacht Excursions",
    description: "Sail in style on luxury yachts"
  },
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80",
    alt: "Hiking adventure in mountain landscape",
    icon: <Mountain className="h-6 w-6" />,
    title: "Mountain Treks",
    description: "Discover breathtaking mountain views"
  }
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <div className="relative h-[80vh] overflow-hidden">
      {/* Image carousel */}
      <Carousel 
        className="h-full w-full"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <CarouselContent>
          {carouselImages.map((image, index) => (
            <CarouselItem key={index} className="h-[80vh] relative">
              <div className="absolute inset-0">
                {/* Background image */}
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="h-full w-full object-cover"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-xl text-white">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                        {image.icon}
                      </div>
                      <span className="text-lg font-medium">{image.title}</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                      Explore Amazing <span className="text-trypie-400">Destinations</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl mb-8">
                      {image.description} with fellow travelers and create memories that last a lifetime.
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-10 rounded-full transition-all ${
                currentIndex === index ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 border-none text-white" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 border-none text-white" />
      </Carousel>
      
      {/* Wave effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroCarousel;

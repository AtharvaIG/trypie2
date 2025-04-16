
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-12 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-display font-bold text-trypie-600">Trypie</span>
            </Link>
            <p className="text-gray-600 text-sm">
              A community-driven travel platform designed to enhance travel experiences with real-time insights and AI-powered recommendations.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  Reviews
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  Experiences
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  AI Recommendations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/groups" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  Travel Groups
                </Link>
              </li>
              <li>
                <Link to="/groups" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  Influencer Trips
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  Rewards Program
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  Become a Partner
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">About</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-trypie-600 transition-colors text-sm">
                  Terms & Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Trypie. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

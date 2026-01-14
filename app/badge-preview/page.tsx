import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function BadgePreviewPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/lincoln-technologies-logo.jpg"
            alt="Lincoln Technologies"
            width={200}
            height={80}
            className="mx-auto"
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl font-serif font-semibold text-gray-900 mb-6 leading-tight">
          Lincoln Technologies is excited to issue you Javascript Fundamentals!
        </h1>

        {/* Subheading */}
        <p className="text-gray-600 mb-12">
          Congrats Colin Di Meo! You've earned a badge. Accept it below and share with your network.
        </p>

        {/* Badge Image */}
        <div className="mb-8">
          <Image
            src="/circular-badge-with-lincoln-technologies-logo-and-.jpg"
            alt="Javascript Fundamentals Badge"
            width={200}
            height={200}
            className="mx-auto"
          />
        </div>

        {/* Badge Details */}
        <div className="mb-8">
          <p className="text-gray-700 font-medium mb-1">Javascript Fundamentals</p>
          <p className="text-gray-500 text-sm">Issuer: Lincoln Technologies</p>
        </div>

        {/* Accept Button */}
        <Button className="mb-4 px-8 py-6 text-base" style={{ backgroundColor: "#2b97cf" }}>
          Accept your badge
        </Button>

        {/* Alternative Accept Link */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm mb-1">or accept your badge by clicking:</p>
          <a
            href="https://www.credly.com/go/qfJVxULEmrEWr6M6OZiP6Q"
            className="text-sm text-gray-500 hover:underline break-all"
          >
            https://www.credly.com/go/qfJVxULEmrEWr6M6OZiP6Q
          </a>
        </div>

        {/* Learn More Section */}
        <div className="mb-12">
          <p className="text-purple-700 mb-2">Wondering what happens when you accept a badge?</p>
          <a href="#" className="text-[#2b97cf] hover:underline font-medium">
            Learn more.
          </a>
        </div>

        {/* Divider */}
        <hr className="border-gray-300 mb-12" />

        {/* What's Next Section */}
        <h2 className="text-2xl font-serif font-semibold text-purple-700 mb-8">What's next?</h2>

        <div className="flex flex-col md:flex-row items-center gap-8 text-left">
          {/* Illustration */}
          <div className="flex-shrink-0">
            <Image src="/people-celebrating-with-laptop-illustration.jpg" alt="Celebrate illustration" width={250} height={200} />
          </div>

          {/* Text Content */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Celebrate your new skills</h3>
            <p className="text-gray-600 leading-relaxed">
              Accept your badge to share your new skills with your professional network and colleagues.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

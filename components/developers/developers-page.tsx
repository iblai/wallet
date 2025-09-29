"use client"

import { ArrowRight, FileText, Building2, CreditCard, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[#fefefe] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Developer API</h1>
            <p className="text-gray-600 max-w-2xl leading-relaxed">
              Start with the basics by reading about how the Credly API works or jump right into writing code on our
              badge platform. The Credly Rest API allows users to manage badges they have been issued and issue badges
              on behalf of organizations.
            </p>
          </div>

          {/* Badge Icon */}
          <div className="ml-8 flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Award className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center bg-gradient-to-r from-blue-500 to-teal-400 rounded-full px-8 py-4 shadow-lg">
              {/* ISSUE */}
              <div className="flex flex-col items-center text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">ISSUE</span>
              </div>

              <ArrowRight className="w-6 h-6 text-white mx-6" />

              {/* EARN */}
              <div className="flex flex-col items-center text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">EARN</span>
              </div>

              <ArrowRight className="w-6 h-6 text-white mx-6" />

              {/* BROADCAST */}
              <div className="flex flex-col items-center text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">BROADCAST</span>
              </div>
            </div>
          </div>

          {/* Process Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-sm text-gray-600">Organizations ISSUE badges for things they teach or facilitate.</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Users EARN badges when they showcase their professional skills.</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Users can share the badges they earn to BROADCAST their potential.
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="mb-8">
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-600 mb-2">Getting Started with Credly</h3>
                  <p className="text-gray-600 text-sm">
                    Get a basic walk-through on how Credly works and how you will integrate your users and achievements.
                    You will also get an overview of how to use the web service API and all available features.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-4 flex-shrink-0 bg-transparent">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Web Service API */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Web Service API</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Whether you're an expert developer or a beginner, integrating with the badges platform is easy. We
                    offer a Rest API that will allow you to quickly get started issuing badges from your organization.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto font-normal">
                    Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizations */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Organizations</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    An organization is the entity associated with a user that is authorized to issue badges via Credly.
                    Once an organization has been created it may start creating badge templates and issuing badges to
                    users.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto font-normal">
                    Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credentials Templates */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Credentials Templates</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    A template for a badge that can be issued to a user. Each badge template contains a unique visual
                    image and includes important data that links back to the issuer, as well as associated criteria and
                    standards.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto font-normal">
                    Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issued Credentials */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Issued Credentials</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Issued badges may come from multiple sources and may be displayed on a single profile. Issued badges
                    may contain an expiration date, and may be revoked by the issuing organization. Issued badges may
                    also be shared outside the Credly system.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto font-normal">
                    Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

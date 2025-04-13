import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogPosts } from "@/components/community/BlogPosts";
import { ReferralProgram } from "@/components/community/ReferralProgram";
import { AchievementBadges } from "@/components/community/AchievementBadges";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("blog");
  
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold">Community & Education</h1>
            <p className="text-gray-500 mt-2">
              Learn, grow, and connect with other real estate investors
            </p>
          </div>
          
          <Tabs defaultValue="blog" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="blog">Blog & Videos</TabsTrigger>
              <TabsTrigger value="referral">Referral Program</TabsTrigger>
              <TabsTrigger value="badges">Achievement Badges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="blog" className="mt-6">
              <BlogPosts />
            </TabsContent>
            
            <TabsContent value="referral" className="mt-6">
              <ReferralProgram />
            </TabsContent>
            
            <TabsContent value="badges" className="mt-6">
              <AchievementBadges />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
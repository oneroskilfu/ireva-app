import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ForumCategories } from "@/components/forum/ForumCategories";
import { ForumTopicList } from "@/components/forum/ForumTopicList";
import { ForumActions } from "@/components/forum/ForumActions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Flame, 
  Clock, 
  Award
} from "lucide-react";

export default function ForumPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("latest");
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-6">
            {/* Forum Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Community Forum</h1>
                <p className="text-gray-500 mt-2">
                  Connect with fellow investors, ask questions, and share insights
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {user ? (
                  <Button>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    New Topic
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => window.location.href = "/auth"}>
                    Sign in to Participate
                  </Button>
                )}
              </div>
            </div>
            
            {/* Forum Layout - Categories Sidebar and Topics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar with Categories */}
              <div className="lg:col-span-1">
                <ForumCategories 
                  activeCategory={activeCategory} 
                  onSelectCategory={setActiveCategory} 
                />
              </div>
              
              {/* Main Content - Topic Lists */}
              <div className="lg:col-span-3 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="latest" className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Latest
                      </TabsTrigger>
                      <TabsTrigger value="trending" className="flex items-center">
                        <Flame className="mr-2 h-4 w-4" />
                        Trending
                      </TabsTrigger>
                      <TabsTrigger value="top" className="flex items-center">
                        <Award className="mr-2 h-4 w-4" />
                        Top
                      </TabsTrigger>
                    </TabsList>
                    
                    <ForumActions />
                  </div>
                  
                  <TabsContent value="latest" className="pt-4">
                    <ForumTopicList 
                      type="latest"
                      categoryId={activeCategory}
                    />
                  </TabsContent>
                  
                  <TabsContent value="trending" className="pt-4">
                    <ForumTopicList 
                      type="trending"
                      categoryId={activeCategory}
                    />
                  </TabsContent>
                  
                  <TabsContent value="top" className="pt-4">
                    <ForumTopicList 
                      type="top"
                      categoryId={activeCategory}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
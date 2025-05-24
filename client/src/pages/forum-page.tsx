import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ForumCategories } from "@/components/forum/ForumCategories";
import { ForumTopicList } from "@/components/forum/ForumTopicList";
import { ForumActions } from "@/components/forum/ForumActions";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, TrendingUp, Award } from "lucide-react";

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<string>("categories");
  const [topicType, setTopicType] = useState<"latest" | "trending" | "top">("latest");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Mobile tabs for responsive design */}
            <div className="md:hidden w-full">
              <Tabs 
                defaultValue="categories" 
                onValueChange={(value) => setActiveMobileTab(value)}
                className="w-full mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="categories" className="mt-4">
                  <ForumCategories 
                    activeCategory={activeCategory} 
                    onSelectCategory={(categoryId) => {
                      setActiveCategory(categoryId);
                      setActiveMobileTab("topics");
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="topics" className="mt-4">
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold tracking-tight">
                        {activeCategory ? "Category Topics" : "All Topics"}
                      </h2>
                      <ForumActions />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {activeCategory && (
                          <button 
                            onClick={() => setActiveCategory(null)}
                            className="text-sm text-primary hover:underline"
                          >
                            ← All Categories
                          </button>
                        )}
                      </div>
                      <div className="w-36">
                        <Select
                          value={topicType}
                          onValueChange={(value) => setTopicType(value as "latest" | "trending" | "top")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="trending">Trending</SelectItem>
                            <SelectItem value="top">Top</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <ForumTopicList 
                    type={topicType} 
                    categoryId={activeCategory} 
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Desktop sidebar */}
            <div className="hidden md:block md:w-1/4 lg:w-1/5">
              <div className="sticky top-24">
                <h2 className="text-xl font-bold mb-4">Categories</h2>
                <ForumCategories 
                  activeCategory={activeCategory} 
                  onSelectCategory={setActiveCategory} 
                />
              </div>
            </div>
            
            {/* Desktop main content */}
            <div className="hidden md:block md:w-3/4 lg:w-4/5">
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {activeCategory ? "Category Topics" : "All Topics"}
                  </h1>
                  <ForumActions />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {activeCategory && (
                      <button 
                        onClick={() => setActiveCategory(null)}
                        className="text-sm text-primary hover:underline"
                      >
                        ← All Categories
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tabs 
                      value={topicType}
                      onValueChange={(value) => setTopicType(value as "latest" | "trending" | "top")}
                      className="w-auto"
                    >
                      <TabsList>
                        <TabsTrigger value="latest" className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="hidden sm:inline">Latest</span>
                        </TabsTrigger>
                        <TabsTrigger value="trending" className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="hidden sm:inline">Trending</span>
                        </TabsTrigger>
                        <TabsTrigger value="top" className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span className="hidden sm:inline">Top</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>
              
              <ForumTopicList 
                type={topicType} 
                categoryId={activeCategory} 
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Building, User, LogIn, LogOut, Lock } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen">
      {/* Header/Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <span className="text-lg font-bold">iREVA Platform</span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/auth-test" className="text-sm text-muted-foreground hover:text-foreground">
              Auth Test
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === "admin" && (
                  <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                    Admin Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 border rounded-full px-3 py-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.username}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Real Estate Investment Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              The most advanced platform connecting investors with property managers for seamless real estate investments.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/auth">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth-test">Try Demo</Link>
              </Button>
            </div>
          </div>
          <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
            <div className="text-center">
              <Building className="h-24 w-24 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-semibold mb-2">Secure Investment Platform</h2>
              <p className="text-muted-foreground">Role-based access ensures your data stays protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Status */}
      {user && (
        <section className="container mx-auto px-4 py-8 border-t">
          <div className="bg-primary/10 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Authentication Status</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background rounded-lg p-4 border">
                <p className="font-medium">User ID</p>
                <p className="text-sm text-muted-foreground mt-1 font-mono">{user.id}</p>
              </div>
              <div className="bg-background rounded-lg p-4 border">
                <p className="font-medium">Username</p>
                <p className="text-sm text-muted-foreground mt-1">{user.username}</p>
              </div>
              <div className="bg-background rounded-lg p-4 border">
                <p className="font-medium">Role</p>
                <p className="text-sm bg-primary/20 text-primary px-2 py-0.5 rounded mt-1 inline-block capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-muted py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Building className="h-5 w-5" />
              <span className="font-bold">iREVA Platform</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <Link href="/auth" className="text-sm text-muted-foreground hover:text-foreground">
                Login/Register
              </Link>
              <Link href="/auth-test" className="text-sm text-muted-foreground hover:text-foreground">
                Auth Test
              </Link>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} iREVA Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
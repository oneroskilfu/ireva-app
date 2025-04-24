import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, HelpCircle, Video } from 'lucide-react';

interface CryptoEducationCardProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const CryptoEducationCard: React.FC<CryptoEducationCardProps> = ({ 
  variant = 'full',
  className = ''
}) => {
  const isCompact = variant === 'compact';

  const resources = [
    {
      id: 1,
      title: 'Getting Started with Cryptocurrency',
      description: 'Learn the basics of crypto wallets, blockchain, and digital assets.',
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      link: '/crypto-education'
    },
    {
      id: 2,
      title: 'How to Connect Your Wallet',
      description: 'Step-by-step guide to connecting MetaMask to iREVA.',
      icon: <Video className="h-5 w-5 text-purple-600" />,
      link: '/crypto-education#wallet-connection'
    },
    {
      id: 3,
      title: 'Crypto Security Best Practices',
      description: 'Protect your digital assets with these essential security tips.',
      icon: <BookOpen className="h-5 w-5 text-green-600" />,
      link: '/crypto-education#security'
    }
  ];

  return (
    <Card className={`${className}`}>
      <CardHeader className={isCompact ? 'pb-3' : ''}>
        <CardTitle className={isCompact ? 'text-base' : 'text-xl'}>Crypto Education Center</CardTitle>
        {!isCompact && (
          <CardDescription>
            Learn about cryptocurrency and blockchain-based property investments
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isCompact ? (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-start space-x-2">
                <div className="mt-0.5">
                  {resource.icon}
                </div>
                <div>
                  <Link href={resource.link}>
                    <span className="text-sm font-medium hover:underline cursor-pointer">{resource.title}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <div key={resource.id} className="group">
                <Link href={resource.link}>
                  <div className="block p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                        {resource.icon}
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            <div className="rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/20 p-4 mt-3">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                  <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">Need Help?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Our crypto experts are available to answer any questions you have about using cryptocurrency with iREVA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href="/crypto-education">
          <div className="w-full">
            <Button variant={isCompact ? "outline" : "default"} className="w-full">
              {isCompact ? "Education Center" : "View All Resources"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CryptoEducationCard;
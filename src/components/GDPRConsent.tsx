import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Cookie } from 'lucide-react';

export const GDPRConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consentGiven = localStorage.getItem('skillx-gdpr-consent');
    if (!consentGiven) {
      // Small delay to ensure smooth animation
      setTimeout(() => {
        setIsLoaded(true);
        setIsVisible(true);
      }, 500);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem('skillx-gdpr-consent', accepted ? 'accepted' : 'declined');
    localStorage.setItem('skillx-gdpr-timestamp', new Date().toISOString());
    setIsVisible(false);
  };

  const handleManageConsent = () => {
    // This would typically open a detailed consent management modal
    console.log('Manage consent preferences');
    // For now, we'll just hide the popup
    setIsVisible(false);
  };

  if (!isLoaded || !isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-background shadow-xl animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Cookie Consent</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-muted-foreground">
              We use cookies to store your quiz responses and improve your experience.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              We use cookies to store quiz responses and provide personalized career recommendations. 
              Your data is processed securely and never shared with third parties.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => handleConsent(true)}
                variant="success"
                className="w-full"
              >
                Accept All Cookies
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleManageConsent}
                  variant="outline"
                  className="flex-1"
                >
                  Manage Preferences
                </Button>
                <Button 
                  onClick={() => handleConsent(false)}
                  variant="ghost"
                  className="flex-1"
                >
                  Decline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
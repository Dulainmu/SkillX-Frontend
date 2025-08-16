import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-muted-foreground text-sm">
              © 2025 SkillX. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Button
              variant="link"
              className="text-muted-foreground hover:text-primary p-0"
              onClick={() => {
                // This would typically open a GDPR consent management modal
                console.log('Manage consent clicked');
              }}
            >
              Manage Consent
            </Button>
            <Button
              variant="link"
              className="text-muted-foreground hover:text-primary p-0"
            >
              Privacy Policy
            </Button>
            <Button
              variant="link"
              className="text-muted-foreground hover:text-primary p-0"
            >
              Terms of Service
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, Users, Table, Menu, X, Radio, Receipt, Gift } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/', label: 'Home', icon: Trophy },
    { path: '/live-betting', label: 'Live', icon: Radio },
    { path: '/my-bets', label: 'My Bets', icon: Receipt },
    { path: '/bonuses', label: 'Bonuses', icon: Gift },
    { path: '/standings', label: 'Table', icon: Table },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-glass-border bg-background/40 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
                <Trophy className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-base font-bold leading-none">RedZone Bets</div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span className="live-dot" /> Premier League · Live
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isExactMatch = item.path === location.pathname;

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isExactMatch ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-glass-border py-4">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isExactMatch = item.path === location.pathname;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isExactMatch ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

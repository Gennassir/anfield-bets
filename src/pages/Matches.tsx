import MatchesList from "@/components/MatchesList";
import Navigation from "@/components/Navigation";

const Matches = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <MatchesList />
      </div>
    </div>
  );
};

export default Matches;

import TeamsList from "@/components/TeamsList";
import Navigation from "@/components/Navigation";

const Teams = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <TeamsList />
      </div>
    </div>
  );
};

export default Teams;

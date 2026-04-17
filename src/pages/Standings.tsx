import StandingsTable from "@/components/StandingsTable";
import Navigation from "@/components/Navigation";

const Standings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <StandingsTable />
      </div>
    </div>
  );
};

export default Standings;

import MarketNewsDashboard from '@/components/financehub/stock/MarketNewsDashboard';

const ContentHub = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Content Hub</h1>
        <p className="mt-2 text-content-secondary">Curated financial content and research in one place.</p>
      </div>

      {/* Market News Section */}
      <MarketNewsDashboard />
    </div>
  );
};

export default ContentHub; 
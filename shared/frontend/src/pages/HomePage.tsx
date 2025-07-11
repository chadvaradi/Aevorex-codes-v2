import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome to FinanceHub</h1>
      <p className="mt-2">
        Start by exploring a stock, for example:{' '}
        <Link to="/stock/AAPL" className="text-blue-600 hover:underline">
          Apple Inc. (AAPL)
        </Link>
      </p>
    </div>
  );
};

export default HomePage; 
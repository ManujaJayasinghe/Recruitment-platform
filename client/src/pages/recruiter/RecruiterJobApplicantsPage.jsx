import { useParams } from 'react-router-dom';

const RecruiterJobApplicantsPage = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Applicants</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Job ID: {id}</p>
        <p className="text-gray-600 mt-2">Coming soon...</p>
      </div>
    </div>
  );
};

export default RecruiterJobApplicantsPage;

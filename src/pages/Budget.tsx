import { useState, useEffect } from "react";
import api from "../utils/axios";

interface Envelope {
  id: number;
  name: string;
  budget_limit: number;
  created_at: string;
}

/**
 * Safely formats a date string (e.g. "2026-08-03", "2026-08-03T00:00:00Z",
 * or MySQL format "2026-06-09 01:42:39") into a readable format like "Aug 03 2026".
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  // Normalize MySQL space-separated datetime to ISO format (replace space with T)
  const normalized = dateStr.replace(' ', 'T');
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

export default function Envelope() {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEnvelopeId, setCurrentEnvelopeId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', budget_limit: '' });

  const fetchEnvelopes = async () => {
    try {
      const response = await api.get('/envelopes');
      setEnvelopes(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching envelopes:', error);
    }
  };

  useEffect(() => {
    fetchEnvelopes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentEnvelopeId(null);
    setFormData({ name: '', budget_limit: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (env: Envelope) => {
    setIsEditing(true);
    setCurrentEnvelopeId(env.id);
    setFormData({ name: env.name, budget_limit: env.budget_limit ? env.budget_limit.toString() : '0' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        budget_limit: formData.budget_limit ? parseFloat(formData.budget_limit) : 0
      };

      if (isEditing && currentEnvelopeId) {
        await api.put(`/envelopes/${currentEnvelopeId}`, payload);
      } else {
        await api.post('/envelopes', payload);
      }
      
      closeModal();
      fetchEnvelopes(); // Refresh the list
    } catch (error) {
      console.error('Error saving envelope:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this envelope?")) {
      try {
        await api.delete(`/envelopes/${id}`);
        setEnvelopes(envelopes.filter(env => env.id !== id));
      } catch (error) {
        console.error('Error deleting envelope:', error);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 font-sans">
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6 w-full">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Envelopes</h2>
              <p className="text-sm text-gray-500">A table of your budget envelopes and their allocations.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={openCreateModal}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                + New Envelope
              </button>
              <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Export
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200 bg-gray-50">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200 bg-gray-50">Budget Limit</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200 bg-gray-50">Date Created</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-200 bg-gray-50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {envelopes.map((env) => (
                  <tr key={env.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-b border-gray-200 group-last:border-b-0">{env.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 border-b border-gray-200 group-last:border-b-0">${Number(env.budget_limit || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 border-b border-gray-200 group-last:border-b-0">{formatDate(env.created_at)}</td>
                    <td className="px-6 py-4 text-sm text-right border-b border-gray-200 group-last:border-b-0">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => openEditModal(env)}
                          className="text-indigo-600 hover:text-indigo-900" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(env.id)}
                          className="text-red-500 hover:text-red-700" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {envelopes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500 border-b border-gray-200">
                      No envelopes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isEditing ? 'Edit Envelope' : 'New Envelope'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Groceries"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit ($)</label>
                <input 
                  type="number" 
                  name="budget_limit"
                  step="0.01"
                  min="0"
                  value={formData.budget_limit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md transition-colors">
                  {isEditing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
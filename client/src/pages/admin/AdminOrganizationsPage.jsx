import { useState, useEffect } from 'react';
import {
  Loader,
  Building2,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Briefcase,
  Users,
  X
} from 'lucide-react';
import adminService from '../../services/adminService';

const AdminOrganizationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expandedOrgs, setExpandedOrgs] = useState(new Set());
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [orgForm, setOrgForm] = useState({ name: '', industry: '' });
  const [deptForm, setDeptForm] = useState({ name: '', organizationId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgsData, deptsData] = await Promise.all([
        adminService.getOrganizations(),
        adminService.getDepartments()
      ]);
      setOrganizations(orgsData);
      setDepartments(deptsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrg = (orgId) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const handleCreateOrg = () => {
    setEditingOrg(null);
    setOrgForm({ name: '', industry: '' });
    setShowOrgModal(true);
  };

  const handleEditOrg = (org) => {
    setEditingOrg(org);
    setOrgForm({ name: org.name, industry: org.industry || '' });
    setShowOrgModal(true);
  };

  const handleSaveOrg = async (e) => {
    e.preventDefault();
    if (!orgForm.name.trim()) {
      alert('Organization name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingOrg) {
        await adminService.updateOrganization(editingOrg.id, orgForm);
      } else {
        await adminService.createOrganization(orgForm);
      }
      setShowOrgModal(false);
      await loadData();
    } catch (error) {
      console.error('Error saving organization:', error);
      alert('Failed to save organization: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDept = (orgId) => {
    setEditingDept(null);
    setDeptForm({ name: '', organizationId: orgId });
    setShowDeptModal(true);
  };

  const handleEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({ name: dept.name, organizationId: dept.organizationId });
    setShowDeptModal(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      alert('Department name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingDept) {
        await adminService.updateDepartment(editingDept.id, deptForm);
      } else {
        await adminService.createDepartment(deptForm);
      }
      setShowDeptModal(false);
      await loadData();
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Failed to save department: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getDepartmentsByOrg = (orgId) => {
    return departments.filter(d => d.organizationId === orgId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations & Departments</h1>
          <p className="text-gray-600 mt-2">
            Manage organizational structure and departments
          </p>
        </div>
        <button
          onClick={handleCreateOrg}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          New Organization
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Organizations</p>
              <p className="text-3xl font-bold text-gray-900">{organizations.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Departments</p>
              <p className="text-3xl font-bold text-gray-900">{departments.length}</p>
            </div>
            <Briefcase className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Organizations List */}
      <div className="space-y-4">
        {organizations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations yet</h3>
            <p className="text-gray-600 mb-4">Create your first organization to get started</p>
            <button
              onClick={handleCreateOrg}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Organization
            </button>
          </div>
        ) : (
          organizations.map((org) => {
            const orgDepts = getDepartmentsByOrg(org.id);
            const isExpanded = expandedOrgs.has(org.id);

            return (
              <div key={org.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Organization Header */}
                <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleOrg(org.id)}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-6 h-6" />
                      ) : (
                        <ChevronRight className="w-6 h-6" />
                      )}
                    </button>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                      {org.industry && (
                        <p className="text-sm text-gray-500">Industry: {org.industry}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{orgDepts.length}</p>
                        <p className="text-xs text-gray-500">Departments</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEditOrg(org)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                      title="Edit organization"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCreateDept(org.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                      title="Add department"
                    >
                      <Plus className="w-4 h-4" />
                      Add Dept
                    </button>
                  </div>
                </div>

                {/* Departments List */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    {orgDepts.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 mb-3">No departments in this organization</p>
                        <button
                          onClick={() => handleCreateDept(org.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >
                          <Plus className="w-4 h-4" />
                          Add First Department
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orgDepts.map((dept) => (
                          <div
                            key={dept.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <Briefcase className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {dept.jobPostingCount} job{dept.jobPostingCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleEditDept(dept)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition"
                                title="Edit department"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Organization Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingOrg ? 'Edit Organization' : 'Create Organization'}
              </h3>
              <button
                onClick={() => setShowOrgModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveOrg} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={orgForm.industry}
                  onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving...' : (editingOrg ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
              <button
                onClick={() => setShowDeptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter department name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization <span className="text-red-500">*</span>
                </label>
                <select
                  value={deptForm.organizationId}
                  onChange={(e) => setDeptForm({ ...deptForm, organizationId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving...' : (editingDept ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrganizationsPage;

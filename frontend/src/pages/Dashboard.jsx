import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import ExitSnapshotCard from '../components/dashboard/ExitSnapshotCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FolderOpen, TrendingUp, Calendar, Trash2, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, valuationsRes] = await Promise.all([
        fetch(`${API}/projects`, { credentials: 'include' }),
        fetch(`${API}/valuations`, { credentials: 'include' })
      ]);

      if (projectsRes.ok) {
        setProjects(await projectsRes.json());
      }
      if (valuationsRes.ok) {
        setValuations(await valuationsRes.json());
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      const response = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newProjectName })
      });

      if (response.ok) {
        const project = await response.json();
        setProjects([project, ...projects]);
        setNewProjectName('');
        setDialogOpen(false);
        toast.success('Project created');
        navigate(`/valuation/new/${project.project_id}`);
      }
    } catch (error) {
      toast.error('Failed to create project');
    }
    setCreating(false);
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project and all its valuations?')) return;
    try {
      const response = await fetch(`${API}/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setProjects(projects.filter(p => p.project_id !== projectId));
        setValuations(valuations.filter(v => v.project_id !== projectId));
        toast.success('Project deleted');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProjectValuations = (projectId) => {
    return valuations.filter(v => v.project_id === projectId);
  };

  const getLatestValuation = (projectId) => {
    const projectValuations = getProjectValuations(projectId);
    return projectValuations[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="dashboard">
      <Navbar />

      <main className="pt-24 pb-12 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-slate-600 mt-1">Manage your startup valuations</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-[#0B4DBB] hover:bg-[#093c96] text-white shadow-lg shadow-blue-900/20"
                data-testid="new-project-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Project name (e.g., TechStartup Series A)"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="input-premium"
                  data-testid="project-name-input"
                />
                <Button 
                  onClick={createProject}
                  disabled={!newProjectName.trim() || creating}
                  className="w-full bg-[#0B4DBB] hover:bg-[#093c96]"
                  data-testid="create-project-btn"
                >
                  {creating ? 'Creating...' : 'Create & Start Valuation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="dashboard-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F0F7FF] flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-[#0B4DBB]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Projects</p>
                <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F0F7FF] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#0B4DBB]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Valuations</p>
                <p className="text-2xl font-bold text-slate-900">{valuations.length}</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F0F7FF] flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#0B4DBB]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Latest Valuation</p>
                <p className="text-2xl font-bold text-slate-900">
                  {valuations.length > 0 ? formatCurrency(valuations[0]?.result?.base || 0) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F0F7FF] flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-[#0B4DBB]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6">Create your first project to start valuating</p>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-[#0B4DBB] hover:bg-[#093c96]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const latestVal = getLatestValuation(project.project_id);
              const projectVals = getProjectValuations(project.project_id);

              return (
                <motion.div
                  key={project.project_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="dashboard-card overflow-hidden group"
                  data-testid={`project-card-${project.project_id}`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#0B4DBB] transition-colors">
                        {project.name}
                      </h3>
                      <button 
                        onClick={() => deleteProject(project.project_id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`delete-project-${project.project_id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {latestVal ? (
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-1">Latest Valuation</p>
                        <p className="text-2xl font-bold text-[#0B4DBB]">
                          {formatCurrency(latestVal.result?.base || 0)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {latestVal.company_info?.company_name}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <p className="text-sm text-slate-500">No valuations yet</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(project.updated_at || project.created_at)}
                      </span>
                      <span>{projectVals.length} valuation{projectVals.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/valuation/new/${project.project_id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full border-[#EEF2F7] hover:bg-[#F0F7FF] hover:border-[#A7C8FF]"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New
                        </Button>
                      </Link>
                      {latestVal && (
                        <Link to={`/valuation/${latestVal.valuation_id}`}>
                          <Button 
                            variant="outline"
                            className="border-[#EEF2F7] hover:bg-[#F0F7FF] hover:border-[#A7C8FF]"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Valuation history */}
                  {projectVals.length > 0 && (
                    <div className="border-t border-[#EEF2F7] bg-[#F8FAFC] px-6 py-3">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Recent</p>
                      <div className="space-y-1">
                        {projectVals.slice(0, 3).map((val) => (
                          <Link 
                            key={val.valuation_id}
                            to={`/valuation/${val.valuation_id}`}
                            className="flex items-center justify-between py-1 hover:text-[#0B4DBB] transition-colors"
                          >
                            <span className="text-sm text-slate-600 truncate">{val.company_info?.company_name}</span>
                            <span className="text-sm font-medium">{formatCurrency(val.result?.base || 0)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

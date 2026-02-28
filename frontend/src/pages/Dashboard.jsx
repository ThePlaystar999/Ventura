import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import ExitSnapshotCard from '../components/dashboard/ExitSnapshotCard';
import ValuationOverTimeChart from '../components/dashboard/ValuationOverTimeChart';
import ValuationBoostOpportunities from '../components/dashboard/ValuationBoostOpportunities';
import ProjectCard from '../components/dashboard/ProjectCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FolderOpen, TrendingUp, Calendar, Trash2, FileText, ExternalLink, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
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
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Determine active project (most recently updated, or first)
  const activeProject = useMemo(() => {
    if (projects.length === 0) return null;
    
    // If user selected a project, use that
    if (selectedProjectId) {
      return projects.find(p => p.project_id === selectedProjectId) || projects[0];
    }
    
    // Default: most recently updated project
    const sorted = [...projects].sort((a, b) => 
      new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
    );
    return sorted[0];
  }, [projects, selectedProjectId]);

  // Get valuations for active project
  const activeProjectValuations = useMemo(() => {
    if (!activeProject) return [];
    return valuations.filter(v => v.project_id === activeProject.project_id);
  }, [activeProject, valuations]);

  // Check if active project has valuations
  const hasValuations = activeProjectValuations.length > 0;

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
        {/* Command Center Hero */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Your Startup Exit Command Center
              </h1>
              <p className="text-slate-600 mt-1">
                Track your valuation. Increase it. Prepare your exit.
              </p>
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

          {/* Exit Snapshot Card */}
          {projects.length > 0 && (
            <ExitSnapshotCard
              projects={projects}
              valuations={valuations}
              selectedProjectId={selectedProjectId}
              onProjectSelect={setSelectedProjectId}
            />
          )}
        </div>

        {/* Stats Overview - Only show when no projects */}
        {projects.length === 0 && (
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
        )}

        {/* Projects Section Header - Only show when projects exist */}
        {projects.length > 0 && (
          <div className="mb-6 mt-8">
            <h2 className="text-lg font-semibold text-slate-900">Your Projects</h2>
            <p className="text-sm text-slate-500">Manage and track valuations for each project</p>
          </div>
        )}

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
            {projects.map((project, index) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                valuations={valuations}
                onDelete={deleteProject}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {/* Valuation Over Time Chart - After Projects */}
        {projects.length > 0 && (
          <div className="mt-8">
            <ValuationOverTimeChart
              valuations={valuations}
              selectedProjectId={selectedProjectId}
            />
          </div>
        )}

        {/* Valuation Boost Opportunities */}
        {projects.length > 0 && (
          <div className="mt-8">
            <ValuationBoostOpportunities
              valuations={valuations}
              selectedProjectId={selectedProjectId}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

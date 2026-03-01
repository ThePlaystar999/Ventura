import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import ExitSnapshotCard from '../components/dashboard/ExitSnapshotCard';
import ValuationOverTimeChart from '../components/dashboard/ValuationOverTimeChart';
import ValuationBoostOpportunities from '../components/dashboard/ValuationBoostOpportunities';
import ProjectCard from '../components/dashboard/ProjectCard';
import BenchmarkBanner from '../components/dashboard/BenchmarkBanner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Skeleton } from '../components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { toast } from 'sonner';
import { Plus, FolderOpen, TrendingUp, FileText, ChevronDown, Sparkles, ArrowRight, Activity, HelpCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-[#F8FAFC]" data-testid="dashboard-loading">
        <main className="py-8 px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <Skeleton className="h-8 w-80 mb-2" />
                <Skeleton className="h-5 w-64" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-44" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main valuation card skeleton */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-8">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-16 w-48 mb-4" />
              <div className="flex gap-8">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            
            {/* Side card skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <Skeleton className="h-5 w-28 mb-4" />
              <Skeleton className="h-12 w-20 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>

          {/* Projects Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                <Skeleton className="h-6 w-40 mb-3" />
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-[#F8FAFC]" data-testid="dashboard">

        <main className="py-8 px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
          {/* CONDITIONAL HERO SECTION */}
          <div className="mb-8">
            {/* Hero Header with Project Selector */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                {/* Conditional Title based on valuations */}
                {projects.length > 0 && !hasValuations ? (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                      Get your first AI Valuation
                    </h1>
                    <p className="text-slate-600 mt-1">
                      Understand what your startup is really worth.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                      Your Startup Exit Command Center
                    </h1>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                          <HelpCircle className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-sm">Track your valuation over time, identify growth opportunities, and prepare for a successful exit.</p>
                      </TooltipContent>
                    </Tooltip>
                    <p className="text-slate-600 mt-1 hidden">
                      Track your valuation. Increase it. Prepare your exit.
                    </p>
                  </div>
                )}
                {hasValuations && (
                  <p className="text-slate-600 mt-1">
                    Track your valuation. Increase it. Prepare your exit.
                  </p>
                )}
              </div>

            {/* Right side: Project Selector + Open Exit OS + New Project Button */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Project Selector Dropdown */}
              {projects.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedProjectId || activeProject?.project_id || ''}
                    onChange={(e) => setSelectedProjectId(e.target.value || null)}
                    className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B4DBB]/20 focus:border-[#0B4DBB] cursor-pointer min-w-[180px]"
                    data-testid="project-selector"
                  >
                    {projects.map(p => (
                      <option key={p.project_id} value={p.project_id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              )}

              {/* Open Exit OS Button - Shows when a project is selected */}
              {activeProject && (
                <Link to={`/projects/${activeProject.project_id}/exit-os`}>
                  <Button 
                    variant={hasValuations ? "default" : "outline"}
                    className={hasValuations 
                      ? "bg-[#0B4DBB] hover:bg-[#093c96] text-white shadow-lg shadow-blue-900/20" 
                      : "border-slate-200 hover:bg-slate-50"
                    }
                    data-testid="open-exit-os-global"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Open Exit OS
                  </Button>
                </Link>
              )}

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant={hasValuations ? "outline" : "default"}
                    className={hasValuations 
                      ? "border-slate-200 hover:bg-slate-50" 
                      : "bg-[#0B4DBB] hover:bg-[#093c96] text-white shadow-lg shadow-blue-900/20"
                    }
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
          </div>

          {/* CONDITIONAL CONTENT based on valuations */}
          {projects.length > 0 && !hasValuations ? (
            /* NO VALUATIONS STATE - First Valuation Hero */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#0842A0] via-[#0B4DBB] to-[#1E6AE1] rounded-2xl p-8 md:p-12 text-white relative overflow-hidden"
              data-testid="first-valuation-hero"
            >
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/80">AI-Powered Valuation</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Discover your startup's true value
                </h2>
                <p className="text-lg text-white/80 mb-6 max-w-xl">
                  Get an accurate valuation based on your metrics, market data, and exit scenarios. 
                  Takes only 5 minutes.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to={activeProject ? `/valuation/new/${activeProject.project_id}` : '/valuation/new'}>
                    <Button 
                      size="lg"
                      className="bg-white text-[#0B4DBB] hover:bg-white/90 font-semibold px-8 shadow-lg"
                      data-testid="start-valuation-cta"
                    >
                      Start Valuation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-2xl font-bold">5 min</p>
                    <p className="text-sm text-white/60">to complete</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3+</p>
                    <p className="text-sm text-white/60">exit scenarios</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">PDF</p>
                    <p className="text-sm text-white/60">report included</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : projects.length > 0 ? (
            /* HAS VALUATIONS STATE - Exit Snapshot + Chart + Opportunities */
            <>
              <ExitSnapshotCard
                projects={projects}
                valuations={valuations}
                selectedProjectId={selectedProjectId || activeProject?.project_id}
                onProjectSelect={setSelectedProjectId}
              />
              {/* Benchmark Banner - Shows constructive tension */}
              <BenchmarkBanner
                valuations={valuations}
                selectedProjectId={selectedProjectId || activeProject?.project_id}
              />
            </>
          ) : null}
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

        {/* Valuation Over Time Chart - Only when active project has valuations */}
        {projects.length > 0 && hasValuations && (
          <div className="mt-8">
            <ValuationOverTimeChart
              valuations={valuations}
              selectedProjectId={selectedProjectId || activeProject?.project_id}
            />
          </div>
        )}

        {/* Valuation Boost Opportunities - Only when active project has valuations */}
        {projects.length > 0 && hasValuations && (
          <div className="mt-8">
            <ValuationBoostOpportunities
              valuations={valuations}
              selectedProjectId={selectedProjectId || activeProject?.project_id}
            />
          </div>
        )}
      </main>
    </div>
    </TooltipProvider>
  );
};

export default Dashboard;

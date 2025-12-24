"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Home, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProjectsPage() {
  // Placeholder data
  const projects = [
    { id: "1", name: "123 Main Street", status: "In Progress", budget: 45000, city: "Austin, TX" },
    { id: "2", name: "456 Oak Avenue", status: "Planning", budget: 32000, city: "Dallas, TX" },
    { id: "3", name: "789 Pine Road", status: "Design", budget: 58000, city: "Houston, TX" },
    { id: "4", name: "321 Elm Boulevard", status: "Completed", budget: 41000, city: "San Antonio, TX" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">
            Manage all your fix & flip projects
          </p>
        </div>
        <Button asChild>
          <Link href="/wizard/step-1">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  project.status === "Completed" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : project.status === "In Progress"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}>
                  {project.status}
                </span>
              </div>
              <CardTitle className="mt-4">{project.name}</CardTitle>
              <CardDescription>{project.city}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Budget</span>
                <span className="font-semibold">${project.budget.toLocaleString()}</span>
              </div>
              <Button variant="ghost" className="w-full mt-4" asChild>
                <Link href={`/projects/${project.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


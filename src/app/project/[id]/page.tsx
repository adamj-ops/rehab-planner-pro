interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  
  return (
    <main className="flex min-h-screen flex-col p-8">
      <h1 className="text-3xl font-bold">Project Details</h1>
      <p className="mt-2 text-muted-foreground">Project ID: {id}</p>
      {/* Project content will go here */}
    </main>
  );
}


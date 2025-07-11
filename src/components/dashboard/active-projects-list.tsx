import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { projects } from "@/lib/data"

export function ActiveProjectsList() {
  const activeProjects = projects.filter(p => p.status === 'In Progress');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Active Projects</CardTitle>
        <CardDescription>
          A summary of projects currently underway.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeProjects.map((project) => {
          const progress = Math.round((project.spent / project.budget) * 100);
          return (
            <div key={project.id}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">{project.name}</p>
                <p className="text-sm text-muted-foreground">{progress}%</p>
              </div>
              <Progress value={progress} aria-label={`${project.name} progress`} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

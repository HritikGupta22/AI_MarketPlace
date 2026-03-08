import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">AI Marketplace - shadcn/ui Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Marketplace</CardTitle>
            <CardDescription>Testing shadcn/ui components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Search products..." />
            <div className="flex gap-2">
              <Button>Primary Button</Button>
              <Button variant="outline">Secondary Button</Button>
              <Button variant="destructive">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
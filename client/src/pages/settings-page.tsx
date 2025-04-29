import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, User, Lock, Bell, Monitor, Sliders } from "lucide-react";

// Profile settings schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  department: z.string().optional(),
});

// Notification settings schema
const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  documentUpdates: z.boolean().default(true),
  workflowAlerts: z.boolean().default(true),
  systemAnnouncements: z.boolean().default(false),
});

// Display settings schema
const displayFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  density: z.enum(["compact", "comfortable", "spacious"]),
  defaultView: z.enum(["list", "grid"]),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type DisplayFormValues = z.infer<typeof displayFormSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      department: user?.department || "",
    },
  });
  
  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      documentUpdates: true,
      workflowAlerts: true,
      systemAnnouncements: false,
    },
  });
  
  // Display form
  const displayForm = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues: {
      theme: "light",
      density: "comfortable",
      defaultView: "list",
    },
  });
  
  const onProfileSubmit = (data: ProfileFormValues) => {
    setIsSaving(true);
    
    // In a real application, this would call a profile update API
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated.",
      });
      setIsSaving(false);
    }, 1000);
  };
  
  const onNotificationSubmit = (data: NotificationFormValues) => {
    setIsSaving(true);
    
    // In a real application, this would call a notification settings update API
    setTimeout(() => {
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved.",
      });
      setIsSaving(false);
    }, 1000);
  };
  
  const onDisplaySubmit = (data: DisplayFormValues) => {
    setIsSaving(true);
    
    // In a real application, this would update display preferences
    setTimeout(() => {
      toast({
        title: "Display settings updated",
        description: "Your display preferences have been saved.",
      });
      setIsSaving(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 lg:p-6 bg-neutral-50">
          <div className="pb-5 border-b border-neutral-200">
            <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage your account settings and preferences
            </p>
          </div>
          
          <div className="mt-6">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="display" className="flex items-center">
                  <Monitor className="h-4 w-4 mr-2" />
                  Display
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center">
                  <Sliders className="h-4 w-4 mr-2" />
                  Preferences
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Manage your account information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-semibold">
                              {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                            </div>
                            <div>
                              <h3 className="text-lg font-medium">{user?.name || "User"}</h3>
                              <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormDescription>
                                  The department you're associated with
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                {/* Password Section */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Update your password
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <FormLabel htmlFor="current-password">Current Password</FormLabel>
                          <Input id="current-password" type="password" />
                        </div>
                        <div className="grid gap-2">
                          <FormLabel htmlFor="new-password">New Password</FormLabel>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="grid gap-2">
                          <FormLabel htmlFor="confirm-password">Confirm Password</FormLabel>
                          <Input id="confirm-password" type="password" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button>
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Configure how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <FormField
                            control={notificationForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                                <div className="space-y-0.5">
                                  <FormLabel>Email Notifications</FormLabel>
                                  <FormDescription>
                                    Receive notifications via email
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="documentUpdates"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                                <div className="space-y-0.5">
                                  <FormLabel>Document Updates</FormLabel>
                                  <FormDescription>
                                    Get notified when documents are updated
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="workflowAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                                <div className="space-y-0.5">
                                  <FormLabel>Workflow Alerts</FormLabel>
                                  <FormDescription>
                                    Receive alerts when documents require your action
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="systemAnnouncements"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                                <div className="space-y-0.5">
                                  <FormLabel>System Announcements</FormLabel>
                                  <FormDescription>
                                    Receive system-wide announcements
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Preferences
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Display Settings */}
              <TabsContent value="display">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>
                      Customize the appearance of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...displayForm}>
                      <form onSubmit={displayForm.handleSubmit(onDisplaySubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <FormField
                            control={displayForm.control}
                            name="theme"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Theme</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select theme" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Choose your preferred color theme
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={displayForm.control}
                            name="density"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Display Density</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select density" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="compact">Compact</SelectItem>
                                    <SelectItem value="comfortable">Comfortable</SelectItem>
                                    <SelectItem value="spacious">Spacious</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Set how dense the interface should be
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={displayForm.control}
                            name="defaultView"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default View</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select default view" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="list">List</SelectItem>
                                    <SelectItem value="grid">Grid</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Choose how documents are displayed by default
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Settings
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Workflow Preferences */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Preferences</CardTitle>
                    <CardDescription>
                      Configure default settings for document workflows
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <FormLabel>Default Routing Mode</FormLabel>
                          <Select defaultValue="strict">
                            <SelectTrigger>
                              <SelectValue placeholder="Select routing mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="strict">Strict Mode</SelectItem>
                              <SelectItem value="flexible">Free Flow Mode</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            Strict mode enforces the predetermined workflow steps, while Free Flow allows routing to any department
                          </p>
                        </div>
                        
                        <div className="grid gap-2">
                          <FormLabel>Default Document Type</FormLabel>
                          <Select defaultValue="">
                            <SelectTrigger>
                              <SelectValue placeholder="Select default document type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              <SelectItem value="1">Patient Transfer</SelectItem>
                              <SelectItem value="2">Lab Request</SelectItem>
                              <SelectItem value="3">Pharmacy Order</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            The default document type when creating new documents
                          </p>
                        </div>
                        
                        <div className="grid gap-2">
                          <FormLabel>Default Initial Department</FormLabel>
                          <Select defaultValue="">
                            <SelectTrigger>
                              <SelectValue placeholder="Select default department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              <SelectItem value="1">Reception</SelectItem>
                              <SelectItem value="2">Cardiology</SelectItem>
                              <SelectItem value="3">Laboratory</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            The default initial department when creating new documents
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>
                          <Save className="mr-2 h-4 w-4" />
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

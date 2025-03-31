
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Initialize admin credentials in localStorage if they don't exist
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminExists = users.some((user: any) => user.role === 'admin');
    
    if (!adminExists) {
      // Add default admin user if none exists
      users.push({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, []);
  
  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must be the same",
        variant: "destructive",
      });
      return;
    }
    
    // Get current credentials from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find the admin user
    const adminIndex = users.findIndex((user: any) => user.role === 'admin');
    
    if (adminIndex === -1) {
      toast({
        title: "Error",
        description: "Admin user not found",
        variant: "destructive",
      });
      return;
    }
    
    // Check if current password is correct
    if (users[adminIndex].password !== currentPassword) {
      toast({
        title: "Incorrect password",
        description: "The current password you entered is incorrect",
        variant: "destructive",
      });
      return;
    }
    
    // Update credentials
    if (username) {
      users[adminIndex].username = username;
    }
    
    if (newPassword) {
      users[adminIndex].password = newPassword;
    }
    
    // Save updated users back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    toast({
      title: "Credentials updated",
      description: "Your admin credentials have been updated successfully",
      variant: "default",
    });
    
    // Clear form
    setUsername('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (field === 'new') {
      setShowNewPassword(!showNewPassword);
    } else if (field === 'confirm') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Update Admin Credentials</CardTitle>
          <CardDescription>
            Change your admin username and password. For security reasons, you need to enter your current password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">New Username (optional)</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-0 h-full"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password (optional)</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-0 h-full"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={!newPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-0 h-full"
                  onClick={() => togglePasswordVisibility('confirm')}
                  disabled={!newPassword}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button type="submit" className="w-full flex items-center gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Mail, Shield, Camera, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Profile() {
    const { user, updateProfile, updatePassword } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    // Profile state
    const [name, setName] = useState(user?.name || "");
    const [photoURL, setPhotoURL] = useState(user?.profileImageURL || "");
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);

        try {
            await updateProfile({ name, profileImageURL: photoURL });
            toast({
                title: "Profile updated",
                description: "Your profile details have been successfully updated.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update profile.",
            });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords do not match",
                description: "New password and confirm password must match.",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                variant: "destructive",
                title: "Weak password",
                description: "Password must be at least 6 characters.",
            });
            return;
        }

        setIsPasswordLoading(true);
        try {
            await updatePassword(newPassword);
            toast({
                title: "Password updated",
                description: "Your password has been changed successfully.",
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update password.",
            });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container mx-auto max-w-6xl py-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="mt-1 hover:bg-transparent"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
                    <p className="text-slate-500 mt-2">
                        Manage your profile information and security preferences.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Settings Section (Full Width) */}
                <div className="space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg font-medium">Profile Information</CardTitle>
                            <CardDescription>Update your photo and personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="max-w-md"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Input
                                            id="role"
                                            value={user.role}
                                            disabled
                                            className="bg-slate-50 text-slate-500 capitalize max-w-md cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="photoURL">Avatar URL</Label>
                                    <div className="flex gap-4">
                                        <Input
                                            id="photoURL"
                                            value={photoURL}
                                            onChange={(e) => setPhotoURL(e.target.value)}
                                            placeholder="https://..."
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Enter a URL for your profile picture.
                                    </p>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isProfileLoading}>
                                        {isProfileLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg font-medium">Security</CardTitle>
                            <CardDescription>Update your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="max-w-md"
                                    />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm Password</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" variant="secondary" disabled={isPasswordLoading}>
                                        {isPasswordLoading ? "Updating..." : "Update Password"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

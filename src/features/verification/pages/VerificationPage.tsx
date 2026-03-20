import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Shield, Camera, FileText, AlertCircle, Upload, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  icon: React.ReactNode;
  required: boolean;
}

interface VerificationBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedAt?: string;
}

export default function VerificationPage() {
  const navigate = useNavigate();
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([]);
  const [badges, setBadges] = useState<VerificationBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    // Simulate loading verification data
    setTimeout(() => {
      setVerificationSteps([
        {
          id: 'photo',
          title: 'Photo Verification',
          description: 'Upload a clear photo of yourself',
          status: 'completed',
          icon: <Camera className="w-5 h-5" />,
          required: true
        },
        {
          id: 'id',
          title: 'ID Verification',
          description: 'Verify your identity with government ID',
          status: 'in_progress',
          icon: <FileText className="w-5 h-5" />,
          required: true
        },
        {
          id: 'social',
          title: 'Social Profile',
          description: 'Connect your social media accounts',
          status: 'pending',
          icon: <Shield className="w-5 h-5" />,
          required: false
        }
      ]);

      setBadges([
        {
          id: 'verified',
          name: 'Verified User',
          description: 'Complete photo and ID verification',
          icon: <CheckCircle className="w-6 h-6" />,
          earned: false
        },
        {
          id: 'trusted',
          name: 'Trusted Member',
          description: 'Maintain good standing for 30 days',
          icon: <Star className="w-6 h-6" />,
          earned: false
        },
        {
          id: 'premium',
          name: 'Premium Verified',
          description: 'Complete all verification steps',
          icon: <Shield className="w-6 h-6" />,
          earned: false
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const completedSteps = verificationSteps.filter(step => step.status === 'completed').length;
    const totalRequiredSteps = verificationSteps.filter(step => step.required).length;
    setOverallProgress(totalRequiredSteps > 0 ? (completedSteps / totalRequiredSteps) * 100 : 0);
  }, [verificationSteps]);

  const handleStartVerification = (stepId: string) => {
    // In a real app, this would navigate to the verification flow
    console.log(`Starting verification for ${stepId}`);
  };

  const getStatusColor = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Verification Center</h1>
          <p className="text-muted-foreground">Build trust and unlock premium features</p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Verification Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Complete required verification steps to unlock all features
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="steps" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="steps">Verification Steps</TabsTrigger>
            <TabsTrigger value="badges">Trust Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="space-y-4">
            {verificationSteps.map((step) => (
              <Card key={step.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full bg-muted ${getStatusColor(step.status)}`}>
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.required && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(step.status)}
                      {step.status === 'pending' && (
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => handleStartVerification(step.id)}
                        >
                          Start
                        </Button>
                      )}
                      {step.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => handleStartVerification(step.id)}
                        >
                          Continue
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            {badges.map((badge) => (
              <Card key={badge.id} className={`overflow-hidden ${!badge.earned ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${badge.earned ? 'bg-yellow-100 text-yellow-600' : 'bg-muted text-muted-foreground'}`}>
                        {badge.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        {badge.earnedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {badge.earned ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Earned
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Benefits Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Benefits of Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Increased Visibility</div>
                  <div className="text-sm text-muted-foreground">Get more profile views</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Trust Badge</div>
                  <div className="text-sm text-muted-foreground">Show verification status</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Premium Features</div>
                  <div className="text-sm text-muted-foreground">Unlock advanced tools</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

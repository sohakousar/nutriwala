import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the session from the URL hash
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Auth callback error:", error);
                    navigate("/auth/signin");
                    return;
                }

                if (session?.user) {
                    // Check if profile exists
                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('user_id')
                        .eq('user_id', session.user.id)
                        .single();

                    // Create profile if it doesn't exist (for OAuth users)
                    if (!existingProfile) {
                        await supabase.from('profiles').insert({
                            user_id: session.user.id,
                            email: session.user.email,
                            full_name: session.user.user_metadata?.full_name ||
                                session.user.user_metadata?.name ||
                                null,
                        });
                    }

                    // Redirect to home page
                    navigate("/");
                } else {
                    navigate("/auth/signin");
                }
            } catch (error) {
                console.error("Unexpected error in auth callback:", error);
                navigate("/auth/signin");
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;

'use client';

import { Button } from '@/components/ui/button';
import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle
} from '@/components/ui/card';

import { OdishaLogo } from '@/components/odisha-logo';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { isAllowedEmail } from '@/lib/auth/auth'; // <-- added


export default function AdminLoginPage() {

const router = useRouter();
const { toast } = useToast();

const [name,setName] = useState('');
const [email,setEmail] = useState('');
const [password,setPassword] = useState('');
const [isLoading,setIsLoading] = useState(false);



const handleLogin = (e: React.FormEvent) => {

e.preventDefault();


/* Basic field validation */
if(!name || !email || !password){

toast({
title:'Information Required',
description:
'Please enter your name, official email, and password.',
variant:'destructive'
});

return;
}


/* EMAIL ALLOWLIST CHECK */
if(!isAllowedEmail(email,'admin')){

toast({
title:'Invalid Email',
description:
'Access denied. This email is not authorized for Admin login.',
variant:'destructive'
});

return;
}



setIsLoading(true);


/* Simulated login success */
setTimeout(()=>{

toast({
title:'Welcome Back',
description:`Successfully authenticated as ${name}. Accessing State Dashboard.`
});

router.push('/admin');

},800);

};



return (
<div className="min-h-screen flex flex-col items-center justify-center bg-secondary p-4">

<Card className="w-full max-w-md shadow-lg border-2 border-primary/10">

<CardHeader className="text-center">

<Link href="/" className="inline-block mb-4">
<OdishaLogo className="h-14 w-14 mx-auto" />
</Link>

<CardTitle className="text-3xl font-headline font-black uppercase tracking-tight text-primary">
State Admin Login
</CardTitle>

<CardDescription className="font-medium italic">
Enter your administrative credentials for state-wide monitoring.
</CardDescription>

</CardHeader>


<CardContent>

<form
onSubmit={handleLogin}
className="space-y-6"
>

<div className="space-y-2">
<Label
htmlFor="name"
className="text-xs font-black uppercase tracking-widest text-muted-foreground"
>
Full Name
</Label>

<Input
id="name"
placeholder="Enter your name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="h-11 font-bold border-2 border-primary/10 focus:border-primary"
/>
</div>



<div className="space-y-2">
<Label
htmlFor="email"
className="text-xs font-black uppercase tracking-widest text-muted-foreground"
>
Official Email
</Label>

<Input
id="email"
type="email"
placeholder="2305133@kiit.ac.in"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="h-11 font-bold border-2 border-primary/10 focus:border-primary"
/>
</div>



<div className="space-y-2">
<Label
htmlFor="password"
className="text-xs font-black uppercase tracking-widest text-muted-foreground"
>
Access Password
</Label>

<Input
id="password"
type="password"
placeholder="********"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="h-11 font-bold border-2 border-primary/10 focus:border-primary"
/>
</div>



<Button
type="submit"
className="w-full h-12 text-lg font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02]"
disabled={isLoading}
>

{isLoading ? (
<Loader2 className="animate-spin mr-2 h-5 w-5" />
):null}

{isLoading
? 'Authenticating...'
: 'Enter Dashboard'
}

</Button>

</form>

</CardContent>

</Card>


<div className="mt-6 text-center">
<Button
variant="link"
asChild
className="text-muted-foreground hover:text-primary font-bold"
>
<Link href="/roles">
← Back to Role Selection
</Link>
</Button>
</div>

</div>
);

}
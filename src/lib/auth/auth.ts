import { emailWhitelist } from "./emailWhitelist";
import { UserRole } from "./types";


export function normalizeEmail(
 email:string
){
 return email.trim().toLowerCase();
}


export function isAllowedEmail(
 email:string,
 role:UserRole
){
 return emailWhitelist[role].includes(
   normalizeEmail(email)
 );
}
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { CreateOrganisationComponent } from './components/organisation/create-organisation/create-organisation.component';
import { OrganisationListComponent } from './components/organisation/organisation-list/organisation-list.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ListContactComponent } from './components/contacts/list-contact/list-contact.component';
import { AddContactComponent } from './components/contacts/add-contact/add-contact.component';
import { ImportContactsComponent } from './components/contacts/import-contacts/import-contacts.component';
import { ListCampaignComponent } from './components/campaign/list-campaign/list-campaign.component';
import { AddCampaignComponent } from './components/campaign/add-campaign/add-campaign.component';
import { ListMessageTemplateComponent } from './components/MesssageTemplate/list-message-template/list-message-template.component';
import { AddMessageTemplateComponent } from './components/MesssageTemplate/add-message-template/add-message-template.component';
import { EventComponent } from './components/campaign/event/event.component';
import { EventLogsComponent } from './components/campaign/event-logs/event-logs.component';
import { ChatComponentComponent } from './components/chat-component/chat-component.component';
import { PasswordChangeGuard } from './guards/password-change.guard';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { PostInsightsComponent } from './components/post-insights/post-insights.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ListPostsComponent } from './components/CampaignPosts/list-posts/list-posts.component';
import { AddPostComponent } from './components/CampaignPosts/add-post/add-post.component';
import { PlatformConfigurationComponent } from './components/PlatformConfiguration/platform-configuration.component';
export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [PasswordChangeGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'create-organisation', component: CreateOrganisationComponent },
  { path: 'list-organisation', component: OrganisationListComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'add-contact', component: AddContactComponent },
  { path: 'edit-contact', component: AddContactComponent },
  { path: 'import-contacts', component: ImportContactsComponent },
  { path: 'list-contacts', component: ListContactComponent, canActivate: [PasswordChangeGuard] },
  { path: 'update-contact', component: AddContactComponent },
  { path: 'add-campaign', component: AddCampaignComponent },
  { path: 'edit-campaign', component: AddCampaignComponent },
  { path: 'list-campaigns', component: ListCampaignComponent, canActivate: [PasswordChangeGuard] },
  { path: 'list-campaign-posts', component: ListPostsComponent, canActivate: [PasswordChangeGuard] },
  { path: 'add-post', component: AddPostComponent },
  { path: 'edit-post', component: AddPostComponent },
  { path: 'campaign-events', component: EventComponent },
  { path: 'event-logs', component: EventLogsComponent, canActivate: [PasswordChangeGuard] },
  { path: 'chat', component: ChatComponentComponent },
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'post-insights', component: PostInsightsComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'platform-configurations', component: PlatformConfigurationComponent },
  //{ path: 'list-organisation', component: OrganisationListComponent }

];

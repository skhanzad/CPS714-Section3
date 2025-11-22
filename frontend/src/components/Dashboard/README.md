# MemberDashboard Structure

The Memeber Dashboard team 2 worked on is primarily comprised of 2 seperate views.
The Member Dashboard Component selects which view to show based on the buttons located on the webpages header

By default the "BaseDashboardView" will be shown. This dashboard contains subcomponents of: UpcomingClasses, ClassCalendar, Acheivement Feed and Memmbership Banner. All of these subcomponents are rendered by the BaseDashboard which itself is rendered when the user selects the dashboard button.

If the user selects the profile button the ProfileEditor component will be rendered. This component also has multiple subcomponents for each feature: EditProfile, EditGoals and MembershipDetails. It also has a typescript file that contains the function that handles the data update to the database. When the ProfileEditor is rendered it renders the other subcomponents and when any profile data is edited by these subcomponents the update propagates back up the order all the way to the MemberDashboard Component.

The overall structure is as follows:


MemberDashboard

-> BaseDashboardView

---> Acheivement Feed

---> Class Calendar

---> MembershipBanner

---> Upcoming Classes



-> ProfileEditor

---> EditProfile

---> EditGoals

---> MembershipDetails

---> (submitProfile)


MemberDashboard: Contains the header of the Dashboard which has the logo, dashboard and profile buttons, notifications button and user sign out drop donw.

BaseDashboardView: Default view when loading dashboard. Contains the basic formatting for the page and pulls all subcomponents for said view.

ProfileEditor: Accessed using the MemberDashboard Header. Contains the basic formatting for the editor page and pulls all subcomponets for said view.

AcheivementFeed (AchvFeed): Contains the acheivement feed component which displays completed and ongoing challenges. The page has a button to switch between completed and in progress and a user is able to scroll through the challenges they've completed and working on.

UpcomingClasses: Component that displays all upcoming classes, date and start time in a list format for the next 7 days. Users can scroll through and view what classes are coming up. They may also press the "view" button which comes with every upcoming class or can press the large button at the bottom to see the schedule view.

ClassCalendar: Component that displays upcoming classes as a weekly schedule view. This also shows past classes and is effectively another way to see your classes. There are three navigation buttons to scroll throughout the weeks and a button labeled "Today" which resets the schedule to show you the week that "today" lands on. 

MemembershipBanner: A widget meant to be located at the top of the page under the header. This widget displays the Members status, tier and renewal date. This component has a button with a crown on it that when pressed sends you to the profile editor view. From there the user may navigate the upgrade their membership, update billing information, etc...

EditProfile: Component that displays the user profile information and allows the user to edit it. When the user clicks the edit button it unlocks the fields and the user can modify their content. This includes uploading a new photo, editing their email, name and phone number. Once the user selects save the component calls upon the submitProfile function to update the database. Based on the result a success or failure banner will show with that logic being handled by the ProfileEditor component. All updated user information the propagates back up all the way to the MemberDashboard.

EditGoals: Component that is very functionally similar to EditProfile. It allows the user to edit the their fitness goals with a simple textbox. There is a button to edit which then turns into a button to either save the data or cancel. Once the user saves it calls upon the same function EditProfile uses to save the data. 

MembershipDetails: This component displays the membership details similarly to MembershipBanner. It's main purpose is to display more details (however, the current implementation does not have more data to show like next payment amount, member since X amount of time which would have been cool). This component also has a button that should route to the billing information page

submitProfile: A helper function used by EditProfile and EditGoals which is used to push the updated information to the supabase database. 
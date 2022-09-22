export const authToken = 
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI0MTIxM2YyNC0zZDRlLTQyMzMtOGVhMS1kNDI0N2M0MzFlODQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY2MzgwMzQ1MSwiZXhwIjoxNjY0NDA4MjUxfQ.-dZZuQqlmSFV4mSOwU_eX4EUlakxH_nZ9ZSY3CLMJTI";
// API call to create meeting
export const createMeeting = async ({ token }) => {
 const res = await fetch(`https://api.videosdk.live/v1/meetings`, {
   method: "POST",
   headers: {
     authorization: `${authToken}`,
     "Content-Type": "application/json",
   },
   body: JSON.stringify({ region: "sg001" }),
 });

 const { meetingId } = await res.json();
 return meetingId;
};
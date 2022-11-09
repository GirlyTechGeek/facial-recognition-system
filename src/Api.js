
export const authToken = 
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI0MTIxM2YyNC0zZDRlLTQyMzMtOGVhMS1kNDI0N2M0MzFlODQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY2NzM5MDUyNywiZXhwIjoxNjY3OTk1MzI3fQ.piXuV6RbxEaNYMiRkAlgwDtsn9LhE5yS5LcjF1RXkyw";
export const meetingsId = 
localStorage.getItem('id')
// API call to create meeting
export const createMeeting = async ({ token }) => {
 const res = await fetch(`https://api.videosdk.live/v1/meetings`, {
   method: "POST",
   headers: {
     authorization: `${authToken}`,
     "Content-Type": "application/json",
   },
   body: JSON.stringify({ region: "sg001" }),
 })
 const { meetingId } = await res.json();
 console.log(meetingId)
 return meetingId;
};
// API call to fetch latest downstream url for a meeting session
export const fetchHlsDownstreamUrl = async ({ meetingId }) => {
  const res = await fetch(
    `https://api.videosdk.live/v2/hls/?roomId=${meetingId}`,
    {
      method: "GET",
      headers: {
        authorization: `${authToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  // const { data } = await res.json();
  // console.log(data);
  const json = await res.json();

  const { downstreamUrl } = json?.data[0];

  return downstreamUrl;
};

export const convertToVietnamTime = (dateString: any) => {
  // Parse the input date string to a Date object in UTC
  const date = new Date(dateString);

  // Convert to Vietnam time (GMT +7)
  const vietnamTime = new Date(date.setHours(date.getHours() + 7));

  return vietnamTime;
};

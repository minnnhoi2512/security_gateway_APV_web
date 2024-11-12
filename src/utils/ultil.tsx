export const convertToVietnamTime = (dateString: any) => {
  // Parse the input date string to a Date object in UTC
  const date = new Date(dateString);

  // Convert to Vietnam time (GMT +7)
  const vietnamTime = new Date(date.setHours(date.getHours() + 7));

  return vietnamTime;
};

export const formatDate = (dateString: any) => {
  if (dateString === null) return;
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};


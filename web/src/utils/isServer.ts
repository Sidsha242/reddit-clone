//if you want to tell youre on the server if window variable is defined

export const isServer = () => typeof window === "undefined";
//This function will return true if we are on the server and false if we are on the client

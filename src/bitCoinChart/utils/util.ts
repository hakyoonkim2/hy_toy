export const convertKrTime = (ms: number) => {
    return new Date(ms).toLocaleTimeString("ko-KR", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
}
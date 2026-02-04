export const bigBubbleWidth = 320;
export const smallBubbleWidth = 260;

export const bigBTR = { top: 68, right: 73 };

export const bigBubbleRight = `calc(${bigBTR.right}% - ${bigBubbleWidth}px)`;
export const bigBubbleTop = `calc(${bigBTR.top}% - ${bigBubbleWidth}px)`;

export const smallBTR = [
  {
    top: bigBTR.top - 20,
    right: bigBTR.right + 30,
  },
  {
    top: bigBTR.top + 25,
    right: bigBTR.right + 40,
  },
  {
    top: bigBTR.top - 30,
    right: bigBTR.right - 35,
  },
  {
    top: bigBTR.top + 20,
    right: bigBTR.right - 28,
  },
];

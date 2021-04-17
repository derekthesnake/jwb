import cv2
import mediapipe as mp
import math, ast, itertools as it, string

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

DIST_PAIRS = [
  (0, 1),
  (1, 2),
  (2, 3),
  (3, 4),
  (0, 5),
  (5, 6),
  (6, 7),
  (7, 8),
  (5, 9),
  (9, 10),
  (10, 11),
  (11, 12),
  (9, 13),
  (13, 14),
  (14, 15),
  (15, 16),
  (0, 17),
  (13, 17),
  (17, 18),
  (18, 19),
  (19, 20)
]

dist = lambda a, b: math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2)
dist_arr = lambda a, b: abs(a - b)

letters = list(map(ast.literal_eval, open('../asl_letters.txt').readlines()[1:]))

def classify(dists):
  x = min(letters, key = lambda i: sum(it.starmap(dist_arr, zip(dists, i))))
  return string.ascii_letters[letters.index(x)]


# For webcam input:
cap = cv2.VideoCapture(0)
with mp_hands.Hands(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5) as hands:
  while cap.isOpened():
    success, image = cap.read()
    if not success:
      print("Ignoring empty camera frame.")
      # If loading a video, use 'break' instead of 'continue'.
      continue

    # Flip the image horizontally for a later selfie-view display, and convert
    # the BGR image to RGB.
    image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
    # To improve performance, optionally mark the image as not writeable to
    # pass by reference.
    image.flags.writeable = False
    results = hands.process(image)

    # Draw the hand annotations on the image.
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    if results.multi_hand_landmarks:
      for hand_landmarks in results.multi_hand_landmarks:
        mp_drawing.draw_landmarks(
            image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
        dists = []
        for (i, j) in DIST_PAIRS:
          dists.append(dist(hand_landmarks.landmark[i], hand_landmarks.landmark[j]))
        print(classify(dists))
    cv2.imshow('MediaPipe Hands', image)
    if cv2.waitKey(0) & 0xFF == 27:
      continue
cap.release()

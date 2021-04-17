import cv2
import mediapipe as mp
import math, ast, itertools as it, string, statistics, os
import tqdm

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

dist = lambda a, b: math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2)
dist_arr = lambda a, b: abs(a - b)

letters = list(map(ast.literal_eval, open('letters.txt').readlines()))
#letters = [[] for _ in range(26)]
#for i in range(1, 8):
#  for a, j in enumerate(map(ast.literal_eval, open(f'../asl_letters/asl_letters_{i}.txt').readlines())):
#    pass
#  print(i, a )
#    # letters[a].append(j)
#input()
#letters = list(map(statistics.mean, letters))

dists = lambda h: [dist(h.landmark[i], h.landmark[j]) for (i, j) in mp_hands.HAND_CONNECTIONS]

def classify(dists):
  fn = lambda i: sum(it.starmap(dist_arr, zip(dists, i)))
  x = min(letters, key = fn)
  # print(list(map(fn, letters)))
  return string.ascii_letters[letters.index(x)]

def read_static():
  with mp_hands.Hands(
      static_image_mode=True,
      max_num_hands=2,
      min_detection_confidence=0.5) as hands:

    letters = []
    for (parent, _, files) in tqdm.tqdm(os.walk('../ASL Alphabet Dataset')):
      if parent == 'ASL Alphabet Dataset':
        continue

      l = []

      for fp in [i for i in files if i.endswith('.png')]:
        image = cv2.flip(cv2.imread(parent + '/' + fp), 1)
        results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        if not results.multi_hand_landmarks:
          continue
        
        hand_1 = results.multi_hand_landmarks[0]
        dists = []
        for (i, j) in mp_hands.HAND_CONNECTIONS:
          dists.append(dist(hand_1.landmark[i], hand_1.landmark[j]))
        l.append(dists)
      l = list(map(statistics.mean, zip(*l)))
      letters.append(l)

  with open("letters.txt", "w") as f:
    for i in letters[1:]:
      f.write(str(i))
      f.write('\n')

# read_static()

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
        print(classify(dists(hand_landmarks)))
    cv2.imshow('MediaPipe Hands', image)
    if cv2.waitKey(0) & 0xFF == 27:
      break
cap.release()

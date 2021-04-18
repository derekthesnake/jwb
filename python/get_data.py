import cv2
import mediapipe as mp
import math, ast, itertools as it, string, statistics, os
import tqdm

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

dist = lambda a, b, z=True: math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2 if z else 0)
dist_arr = lambda a, b: abs(a - b)#  ** 1/4

# letters = list(map(ast.literal_eval, open('letters.txt').readlines()))
# dists = lambda h: [dist(h.landmark[i], h.landmark[j]) for (i, j) in mp_hands.HAND_CONNECTIONS]
# input(mp_hands.HAND_CONNECTIONS)

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

# ANGLE_PAIRS = [(0, 1), (1, 2), (2, 3), (0, 4), (4, 5), (5, 6), (6, 7), (4, 8), (5, 8), (9, 10), (10, 11), (12, 9), (12, 13), (13, 14), (14, 15), (17, 13), (17, 18), (4, 16), (18, 19), (19, 20)]

angles = []
for a, i in enumerate(DIST_PAIRS):
  for b, j in enumerate(DIST_PAIRS):
    if a != b and any(q in j for q in i) and (b, a) not in angles:
      angles.append((a, b))
      # print(i, j)
# print(angles)

def dotproduct(v1, v2):
  return sum((a*b) for a, b in zip(v1, v2))

def length(v):
  return math.sqrt(dotproduct(v, v))

def angle(v1, v2):
  return math.acos(dotproduct(v1, v2) / (length(v1) * length(v2)))

def vec(hand, pair):
  a, b = pair
  return (hand.landmark[b].x - hand.landmark[a].x, hand.landmark[b].y - hand.landmark[a].y , hand.landmark[b].z - hand.landmark[a].z)
  

def dists(hand):
  d = []
  for (a, b) in angles:
    i, j = DIST_PAIRS[a], DIST_PAIRS[b]
    v1, v2 = vec(hand, i), vec(hand, j)
    ang = angle(v1, v2)
    d.append(ang)
  return d


fn_helper = lambda dists: lambda i: sum(it.starmap(dist_arr, zip(dists, i)))
def _classify(dists, hand, l):
  fn_helper = lambda i: sum(it.starmap(dist_arr, zip(dists, i)))
  x = min(l, key = fn_helper)
  # print(list(map(fn, letters)))
  s = string.ascii_letters[l.index(x)]

  if s == 'y':
    if abs(hand.landmark[4].x - hand.landmark[6].x) < abs(hand.landmark[5].x - hand.landmark[9].x):
      s = 'i'

  return s

def classify(dists, hand):
  x = [_classify(dists, hand, i) for i in letters]
  print(x, end=' => ')
  # if max(x, key=x.count) == 'u' and x[3] == 'r':
   #  return 'r'
##  i, j = (5, 6), (5, 9)
##  v1, v2 = vec(hand, i), vec(hand, j)
##  ang = angle(v1, v2)
##  print(ang, end = ' <= ')
  # if x[1] == 's':
  #   return 's'
  # if x[0] == 'o' and max(x, key=x.count) == 'n':
  #   return 'm'
  return max(x, key=x.count)

def verify(dists, hand, target, threshold):
  dist = fn_helper(dists)(letters[0][ord(target) - 97])
  print(dist)
  return dist < threshold

def read_static():
  with mp_hands.Hands(
      static_image_mode=True,
      max_num_hands=2,
      min_detection_confidence=0.5) as hands:

    letters2 = [] # [[] for _ in range(5)] #[0 for _ in range(26)]
    for (parent, _, files) in tqdm.tqdm(list(sorted(os.walk('../ASL Alphabet Dataset'), key = lambda i: i[0][-1]))):
      if parent == '../ASL Alphabet Dataset':
        continue

      l = []

      # print(parent, string.ascii_uppercase.index(parent[-1]))

      # for fp in [i for i in files if i.endswith('.png')]:
      
      # fp = sorted([i for i in files if i.endswith('.png')], key = lambda i: int(i.split("_")[1].split(".")[0]))[-1]
      for idx, fp in enumerate(sorted([i for i in files if i.endswith('.png')], key = lambda i: int(i.split("_")[1].split(".")[0]))):
        image = cv2.flip(cv2.imread(parent + '/' + fp), 1)
        results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        if not results.multi_hand_landmarks:
          continue
        
        hand_1 = results.multi_hand_landmarks[0]
        # letters2[idx].append(dists(hand_1))
        l.append(dists(hand_1))
      # l.append(dists(hand_1))

      # for i in l: print(i)
      # input()

      # annotated_image = image.copy()
      # mp_drawing.draw_landmarks(
      #   annotated_image, hand_1, mp_hands.HAND_CONNECTIONS)
      # cv2.imwrite(
      # './annotated_image.png', cv2.flip(annotated_image, 1))
      # input()
        
      l = list(map(statistics.mean, zip(*l)))
      letters2.append(l)
      # letters2[string.ascii_uppercase.index(parent[-1])] = l
      # letters2.append(l)

  with open("letters.txt", "w") as f:
    for i in letters2:
      f.write(str(i))
      f.write('\n')

# read_static()
letters = [list(map(ast.literal_eval, open('letters.txt').readlines()))]

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
        print(classify(dists(hand_landmarks), hand_landmarks))
        # print([i for i in 'abcdefghijklmnopqrstuvwxyz' if verify(dists(hand_landmarks), hand_landmarks, i, 5)])
    cv2.imshow('MediaPipe Hands', image)
    if cv2.waitKey(5) & 0xFF == 27:
      break
cap.release()

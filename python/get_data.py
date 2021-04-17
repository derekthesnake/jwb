import cv2
import mediapipe as mp
import math, ast, itertools as it, string
import os

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

dist = lambda a, b: math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2)
def relative_scaled(landmarks):
  ret = []
  root = landmarks[0]
  #scales based on the distance between points 0 and 5 (wrist to index knuckle)
  scale = dist(root, landmarks[5])
  for i in landmarks[1:]:
    ret.append(((root.x - i.x)/scale, (root.y - i.y)/scale, (root.z - i.z)/scale))
  return ret

def classify(dists):
  fn = lambda i: sum(it.starmap(dist_arr, zip(dists, i)))
  x = min(letters, key = fn)
  # print(list(map(fn, letters)))
  return string.ascii_letters[letters.index(x)]

def analyze_dir(curr_dir):
  with mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5) as hands:
    for file in os.listdir(curr_dir):
      print(file)
      image = cv2.flip(cv2.imread(curr_dir + "/" + file), 1)
      image.flags.writeable = False
      results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
      if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
#          curr_image = image.copy()
          mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
          # if cv2.waitKey(0) == ord(' '):
          #   dists = []
          #   scale_factor = dist(hand_landmarks.landmark[i])
          #   for i in range()
        cv2.imshow('MediaPipe Hands', cv2.resize(image, (image.shape[1]//2, image.shape[0]//2)))
        while cv2.waitKey(0) != ord(' '):
          pass

for dir in os.listdir("/home/derek/Documents/jwb/dataset"):
  analyze_dir("/home/derek/Documents/jwb/dataset/" + dir)

#   while cap.isOpened():
#     if not success:
#       print("Ignoring empty camera frame.")
#       # If loading a video, use 'break' instead of 'continue'.
#       continue


#     # To improve performance, optionally mark the image as not writeable to
#     # pass by reference.
#     image.flags.writeable = False
#     results = hands.process(image)

#     # Draw the hand annotations on the image.
#     image.flags.writeable = True
#     image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
#     if results.multi_hand_landmarks:
#       for hand_landmarks in results.multi_hand_landmarks:
#         mp_drawing.draw_landmarks(
#             image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
#         dists = []
#         for (i, j) in mp_hands.HAND_CONNECTIONS:
#           dists.append(dist(hand_landmarks.landmark[i], hand_landmarks.landmark[j]))
#         print(dists)
#         # print(classify(dists))
#     cv2.imshow('MediaPipe Hands', image)
#     if cv2.waitKey(0) & 0xFF == 27:
#       continue
# cap.release()

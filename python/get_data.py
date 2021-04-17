import cv2
import mediapipe as mp
import math, ast, itertools as it, string, statistics 

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

dist = lambda a, b: math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2)
dist_arr = lambda a, b: abs(a - b)

letters = list(map(ast.literal_eval, open('../asl_test_3.txt').readlines()))
#letters = [[] for _ in range(26)]
#for i in range(1, 8):
#  for a, j in enumerate(map(ast.literal_eval, open(f'../asl_letters/asl_letters_{i}.txt').readlines())):
#    pass
#  print(i, a )
#    # letters[a].append(j)
#input()
#letters = list(map(statistics.mean, letters))


def classify(dists):
  fn = lambda i: sum(it.starmap(dist_arr, zip(dists, i)))
  x = min(letters, key = fn)
  # print(list(map(fn, letters)))
  return string.ascii_letters[letters.index(x)]


with mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=2,
    min_detection_confidence=0.5) as hands:
  for idx, file in enumerate(file_list):
    # Read an image, flip it around y-axis for correct handedness output (see
    # above).
    image = cv2.flip(cv2.imread(file), 1)
    # Convert the BGR image to RGB before processing.
    results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

    # Print handedness and draw hand landmarks on the image.
    # print('Handedness:', results.multi_handedness)
    if not results.multi_hand_landmarks:
      continue
    image_height, image_width, _ = image.shape
    annotated_image = image.copy()
    hand_1 = results.multi_hand_landmarks[0]
    print(len(reults.multi_hand_landmarks))
    dists = []
        for (i, j) in mp_hands.HAND_CONNECTIONS:
          dists.append(dist(hand_landmarks.landmark[i], hand_landmarks.landmark[j]))
        print(dists)
        # print(classify(dists))
    for hand_landmarks in results.multi_hand_landmarks:
      print('hand_landmarks:', hand_landmarks)
      print(
          f'Index finger tip coordinates: (',
          f'{hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * image_width}, '
          f'{hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y * image_height})'
      )
      mp_drawing.draw_landmarks(
          annotated_image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
    cv2.imwrite(
        '/tmp/annotated_image' + str(idx) + '.png', cv2.flip(annotated_image, 1))

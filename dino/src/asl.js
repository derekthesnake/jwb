// import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils/camera_utils';
import { Hands } from '@mediapipe/hands/hands';
import { drawConnectors, HAND_CONNECTIONS, drawLandmarks } from '@mediapipe/drawing_utils/drawing_utils';

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

let drawC = function(a,c,b,d) {
    if(c&&b){
        d=x(d);
        a.save();
        var e=a.canvas,f=0;
        b=l(b);

        for(var g=b.next();!g.done;g=b.next()){
            console.log("drawing g", g);
            var k=g.value;
            a.beginPath();
            g=c[k[0]];
            k=c[k[1]];
            // g&&k&&(void 0===g.visibility||g.visibility>d.visibilityMin)&&(void 0===k.visibility||k.visibility>d.visibilityMin)&&(
                a.strokeStyle=y(d.color,{index:f,from:g,to:k});
                    a.lineWidth=y(d.lineWidth,{index:f,from:g,to:k});
                    a.moveTo(g.x*e.width,g.y*e.height);
                    a.lineTo(k.x*e.width,k.y*e.height);
            ++f;
            a.stroke()}
        a.restore();
    }
};

var letters = [[[0.601768538792021, 0.7119524947900248, 1.2679235093171262, 0.35211550486865195, 0.4445050023815961, 0.729944679801462, 1.989955954180218, 0.7560446408045891, 2.4969083426859413, 1.627455009355031, 0.3972057505509283, 1.4693024377458543, 0.21756765674002454, 2.19859195876453, 1.3929822860838637, 0.8139993705938278, 1.3905018950370032, 0.09231864183618742, 2.337576263033472, 1.4033233758363552, 0.6700909835819746, 1.3962463589143863, 0.6565470618955004, 1.5805586211650533, 2.3202819473842418, 0.5794893199716337],
    [0.7899748261858237, 1.0265332006820278, 1.3224904428252218, 1.0800620147551372, 0.7962723277712884, 0.3757150778325598, 1.5337685516889845, 0.5459690722811711, 0.16663505913277818, 1.2363735359978194, 0.16013224339796098, 1.2317725715776464, 0.6249396681216122, 0.18099179759713824, 1.7549416868451835, 0.11262294420890649, 1.7530845502273649, 0.44958035605243923, 0.14274279951071867, 2.1152074177218108, 0.1183040677107382, 1.9162668503335327, 0.24369801275162517, 2.1243251997252375, 0.057805484534456594, 0.21180497303280696],
    [0.6048549799081686, 0.9028413544019075, 1.3769286175685462, 0.310928311313287, 0.10040589459898717, 0.5029814489142758, 1.8130090280452025, 0.6764704829176672, 0.5293640178566557, 1.4615135481191908, 0.36803824302117605, 1.3758572610549247, 0.45525110878112324, 0.7939402595488548, 1.7095809673855167, 0.49801104012242514, 1.7279582036167223, 0.2613038260553748, 0.7817561975306693, 1.8915871351245446, 0.41500668296849824, 1.7655239488817778, 0.46244997015175326, 1.835891499236942, 0.4700233075752622, 0.22088092064104722],
    [0.6454948921540089, 1.0525004951607748, 1.2611891033185667, 0.3989329794250524, 0.21650396846423609, 0.27941993907799584, 1.8696015805262234, 0.6023389829120405, 0.1844500107737853, 1.602408264837341, 0.1074107613859569, 1.4902663171092014, 0.42784608118786377, 1.7029411913691548, 1.7554036469078955, 0.5274754325256704, 1.6945806057222985, 0.20098590969924968, 1.625526184505658, 1.8039257121562935, 0.5328118361861899, 1.7784256689310332, 0.3812835538920332, 1.7999108740436016, 1.2457475437464962, 0.6193713707436116],
    [0.6910942401654236, 1.013261382645804, 1.3641864425674692, 0.9527896826749991, 0.9886258420389996, 0.467957286104227, 1.6896659756687424, 0.6041577737235511, 2.2924651602769255, 1.387654971537506, 0.29041856433318525, 1.3097691886995506, 0.40746797961040576, 2.2346124637186637, 1.534411507159858, 0.4425400351327024, 1.5096310986616703, 0.29690284577491804, 2.443172146402835, 1.714125585136853, 0.3713005152395944, 1.6718351780787257, 0.27368584462509676, 1.768838532920463, 2.298864061299628, 0.43101829746784504],
    [0.4924136164662818, 0.9268291369571444, 1.3064560747861613, 0.29745592551740824, 0.4611632356188291, 0.4616450424617098, 1.31877434013029, 0.5731269790822384, 1.2650340883267859, 1.4236553885398335, 0.5806823799056055, 1.142690033097705, 0.6579736532795182, 0.2452742240850591, 1.7471492884299744, 0.04331251388948599, 1.6242414726751573, 0.4392063884042123, 0.14270679657657917, 2.0311700394184653, 0.044775000954142934, 1.7232740939497042, 0.170847010073849, 1.8864801854975528, 0.06015951841548787, 0.10897467348127642],
    [0.7839571624458996, 0.8153955677466193, 1.6605224928863083, 0.48049407864178356, 0.4101889809276509, 0.9413694310700264, 2.123868731820439, 0.9432161704331805, 0.17694717389059517, 1.5381772994931018, 0.2105844386464545, 1.4278780715693344, 0.18701210000722862, 1.6327102216149494, 1.3769162475236578, 0.6636784154368681, 1.4327572364913748, 0.06276507424619614, 1.6631512751085096, 1.416065693449871, 0.7046514477114378, 1.3379232729685686, 1.3260104328800142, 1.5328600703327864, 1.6190238277121796, 0.7415379826137828],
    [0.8861736530936802, 0.6852984081820683, 1.5336488717203516, 0.5036446788187885, 0.19555502037111971, 0.9250877306270332, 2.113773774263475, 0.9512042647694249, 0.14794627578495784, 1.5772761769532915, 0.10975024571546277, 1.6393300784698173, 0.2466816264973883, 0.2866403326240646, 1.6774857973647292, 0.1461457994269996, 1.5348827765850486, 0.05549708014882221, 1.945100780588985, 1.4918143331800644, 0.30603806558196883, 1.3000060293230384, 1.3527964675533777, 1.6305256655432585, 1.6618183556447312, 0.33314577725324146],
    [0.49939585830314953, 0.5840595285316668, 1.1309516384332128, 0.2637473188558226, 0.21064260496353046, 1.1958556408334937, 1.9472071105627455, 0.6628054047461086, 1.8031798757319946, 1.3473658814215657, 0.6826172441396772, 1.289082675106142, 0.23785843058893483, 1.6179108124792263, 1.1651656267916295, 0.6517529806202252, 1.2670752671690253, 0.049896811863147546, 1.9396577832400699, 1.2662982276414156, 0.5309410324975398, 1.4348497053862814, 0.2503288847205107, 1.6118742793461969, 0.1572968309911321, 0.16266559626144372],
    [0.5624223022099581, 0.8883092903923766, 1.6035760115061677, 0.3173179464014943, 0.33707552636721405, 1.1747371818675851, 2.0104113848164653, 0.7829494218923381, 1.3180422825871136, 1.7278300105463211, 0.5877926778309907, 1.7337334009285306, 0.2448830852895655, 1.8038126553029181, 1.5894640092632442, 0.4924633640315331, 1.6871296777270872, 0.18573804736245858, 1.6764594339758754, 1.5233528181158449, 0.3603369916529604, 1.368197371832818, 0.6010571766328934, 1.4461703543741107, 0.08459265370220541, 0.19354952325484182],
    [0.6959588872740856, 0.7024282372098487, 1.1458642634591718, 0.4056516353890062, 0.1181520241306681, 0.28377318075718955, 1.8729652239236168, 0.6960033636416767, 0.059705932554070654, 1.767847736711364, 0.1418374131683657, 1.5089166836176822, 0.49748888583332107, 0.17106762136524126, 1.8936912866210505, 0.13896479706560197, 1.6138328819553038, 0.11467670645620104, 1.8691924726344586, 1.6628958516532002, 0.41713815299241636, 1.721970425809891, 0.7639457609807122, 1.760412145481236, 1.8837551837761917, 0.390750034919887],
    [0.7168588124286278, 0.9278037775527189, 1.330010194037235, 0.12325242613131691, 0.5471252150903919, 0.3901113635748938, 1.8985234507906108, 0.6867722733024566, 0.07199887867010221, 1.5570574816219562, 0.06782628773460057, 1.629016322455531, 0.37586982439441324, 1.6961667123899211, 1.4738551866337646, 0.48751576131791957, 1.3988057554227167, 0.13948409010771023, 1.488468672529649, 1.3848822430406622, 0.4333694618517002, 1.5821683436393077, 1.0550442505107955, 1.554118120219954, 1.6137812092512103, 0.3336439136267505],
    [0.5918890133530706, 0.7778242777759904, 1.1731750702079202, 0.467205162296629, 0.4525967549657658, 0.899916347542009, 1.7499984565594064, 0.6342483828802279, 1.5498551736726685, 1.6382260592040792, 0.28996357049063015, 1.5934642516656774, 0.43407186760739325, 1.6916885436689248, 1.5191819959661839, 0.4263523354866735, 1.5300564767141902, 0.27415150187555826, 1.8313483502019547, 1.4884176926616053, 0.39721706778556043, 1.5293218015868222, 0.8457318521727069, 1.5215297872144529, 1.5761521369452616, 0.3079061878531797],
    [0.6353701054736385, 0.7208193548166314, 1.1389260535831958, 0.6156195171707104, 0.47095012792152835, 0.8939238015145401, 1.7865489714488334, 0.6507909417284624, 1.6781462537011533, 1.6333907433880912, 0.34386366564603926, 1.58892665544797, 0.4056989355896577, 1.7437272845410043, 1.4863410238631811, 0.5673094139830176, 1.4113409497287792, 0.229298386978358, 1.6724453610919914, 1.3503550620003149, 0.5959714111405772, 1.508243765769456, 1.0907118287172535, 1.4509798992094243, 1.492451378965056, 0.7122889420529186],
    [0.6328975559118961, 0.9482448105568803, 1.3516285772789065, 0.360729026230649, 0.20015322111988404, 0.5672066403731051, 1.6858450509357212, 0.6653335986081631, 1.14043439548976, 1.3979080797853103, 0.5169867440013539, 1.3804197325361358, 0.5314820396078671, 1.4124653121838848, 1.6866102348986236, 0.5496134073312078, 1.6839073406199985, 0.25953198523770665, 1.5035155143325827, 1.7953298948714356, 0.5129019127540775, 1.6675493971970006, 0.5447225420128216, 1.7879553937054768, 1.0599846689732684, 0.5206039937446338],
    [0.21347959444625186, 0.5585019171584156, 0.9876686948147038, 0.6820960415924024, 0.5176704628237009, 1.1728681685097304, 1.9557200969087152, 0.6539369735029934, 0.3148201214465805, 1.660881013023496, 0.15996550223176598, 1.6738097426477714, 0.5551493934308078, 0.6933347286651389, 1.2136537780156944, 0.2213790068851865, 1.1873797844649698, 0.3272020035150776, 0.9230044074510755, 0.8814122285411947, 0.47198566051147645, 1.49823208775595, 1.429633537005389, 0.7874722218233334, 0.7294361617152915, 0.5466750335982903],
    [0.5142939817353995, 0.7134780878014667, 1.2654407297396288, 0.3642887595173925, 0.2642585898935981, 1.171400143745547, 1.8781324825785302, 0.6532361113351784, 0.28626834962448217, 1.7182935925210183, 0.19357512852210412, 1.7802832886621096, 0.4088946767961513, 0.9715639713466359, 1.472240135097575, 0.5416531812113581, 1.4417694621870594, 0.23514681757292152, 1.2445756689763157, 1.2392623883141196, 0.5990823079331996, 1.3947336667551267, 1.4603163366002703, 1.172404293913092, 1.211165483419513, 0.8679620565580032],
    [0.6396771151229483, 1.0171924461683777, 1.3952120941747257, 0.6411409288959935, 0.5746943593847389, 0.3569227505819231, 1.6966349863535277, 0.6543967527057228, 0.10144392542412826, 1.3477500409464638, 0.1255514100714919, 1.4168259424689882, 0.542555786033225, 0.3061920886337702, 1.9020910757514626, 0.19421628276256064, 1.6194501157036316, 0.21669614134913387, 2.0072995614956666, 1.8073922222759287, 0.397425242692612, 1.7620377619577612, 0.5587736351006435, 1.8230611574829532, 1.8046406185792507, 0.4470995252996822],
    [0.49678480207710424, 0.8133861451586194, 1.1938630454200532, 0.5820316616924492, 0.8066014354020709, 0.6916940436374465, 1.8655017155431068, 0.6752564726710035, 1.9953941952449492, 1.6112533515379543, 0.453493612493607, 1.555306254203701, 0.3581858587264658, 1.9468152399493222, 1.4747911934399147, 0.5930444492575205, 1.4469584311085208, 0.19625816934596174, 2.1268203262651677, 1.4563988365594531, 0.5135727328092631, 1.5304724823814557, 0.5732189460164683, 1.6572066396324936, 2.29897513471959, 0.4407413498327274],
    [0.6371192644671494, 0.6677489829589108, 1.2417612554451716, 0.4315628788871526, 0.19259212139659365, 0.7383099032435205, 1.819315244453542, 0.7360155768217318, 1.4670999125189523, 1.4727390979156378, 0.6226743114844981, 1.3942738305535087, 0.3326582158378639, 1.783623116088623, 1.3112163959860008, 0.43185948506608296, 1.2678945646080253, 0.12180690464148884, 1.8133684968543098, 1.292387051114976, 0.3838447846304502, 1.418429864680606, 0.7898353520556004, 1.4703771284273592, 2.084788174340259, 0.2819975139427187],
    [0.7026962604241404, 0.9438277559675784, 1.2354783254008381, 0.6817454252368478, 0.26249308889575845, 0.30167278880166726, 1.6685294087460028, 0.629720985723312, 0.07398791606352041, 1.4427202395722942, 0.14886805987046745, 1.4670840016484727, 0.6969101941212539, 0.1347906539772796, 2.011912461135176, 0.0954395173491214, 1.619941470985289, 0.2914453972976505, 1.8798047999690326, 1.7712013846857022, 0.5084076100731222, 1.9022997891533537, 0.6266593241505496, 1.746046004626397, 1.687198900902924, 0.5615386411218546],
    [0.5903309792543255, 0.8430115169436903, 1.102187112778965, 0.7202528592424675, 0.2443189025414288, 0.18161691352967643, 1.7863525224584418, 0.6177657067774733, 0.07065627424314538, 1.741725275748446, 0.15425446136493173, 1.440662335899653, 0.6494916919879471, 0.07983267558958528, 1.9618269840387932, 0.0700444836608787, 1.543086770479305, 0.28950304568895774, 1.6664818705366828, 1.5704926924739162, 0.38550996231096235, 1.880995586278175, 0.6090756864089396, 1.6112913233783812, 1.6613775718593558, 0.4242332989484201],
    [0.6703859204340372, 0.9756840199617819, 1.2941835685444871, 0.9041750455717691, 0.31369005773168374, 0.10548547635008458, 1.5974316859685564, 0.648545904215682, 0.0522058890623086, 1.5507388097497, 0.08383071533238941, 1.3299193664763185, 0.7176908458540554, 0.15191863765653577, 1.992405711630635, 0.11132082788512486, 1.7547641608360562, 0.4415993865772984, 0.09742639459323979, 2.0863738079291547, 0.1077903801068049, 1.917020467296754, 0.6788002955533768, 1.7890781977072532, 1.6229152289098243, 0.469394213934919],
    [0.652904738675007, 0.9444500272768231, 1.2140472394187838, 0.6853545635757042, 0.6160820503973186, 0.5050430790386757, 1.8799768288382899, 0.6623447574893534, 0.5680120343927624, 1.57522173843885, 0.9620213760425997, 1.5850818891630687, 0.5032784321061947, 1.5690248435781955, 1.401509865052179, 0.7264815977828809, 1.35349674456526, 0.19128400228948653, 1.5821025304804466, 1.2664001285585171, 0.8612631166329493, 1.6398322163366132, 1.006872426850927, 1.4360119927795614, 1.6323106929726263, 0.7774040079760354],
    [0.6932890511703536, 0.7598227195189153, 1.3307978452245715, 0.08125166718206318, 0.4081260716914977, 1.1620355404605882, 1.8732909191646143, 0.7047538307679287, 1.8709158267266643, 1.4448531559951534, 0.5339932679388875, 1.5115151857361522, 0.2893608846735705, 1.8063271788915116, 1.3343937947075823, 0.5604738093021521, 1.371264825943882, 0.1449152042256175, 2.1506702165879803, 1.3649752205472987, 0.4492157251880068, 1.3873712130663145, 0.14234164156950865, 1.4056171562013073, 0.10982189265550266, 0.17384215630109573],
    [0.45677776317714375, 0.8042779838909945, 1.0813579162687754, 0.5762721964129379, 0.5754463373297202, 0.4615463432984671, 1.9350478134936342, 0.6436994335579524, 0.32718770937889496, 1.7317717636736072, 0.32925875182616254, 1.610787696766896, 0.604907238096479, 1.4850085005190752, 1.3259805652974264, 0.6213085471608216, 1.240177422383523, 0.22554547830075153, 1.5314389596085944, 1.1030526437112906, 0.647671564642562, 1.6657833466018321, 0.9737542226012436, 1.1250185207897447, 1.523605780958026, 0.5996557590269209]]];

class Queue {
    constructor() {
        this.queue = [];
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    poll() {
        return this.queue.shift();
    }

    push(el) {
        this.queue.push(el);
    }
}

let queue = new Queue();

function dist(a, b, z = true) {
    let add = 0;
    if (z) {
        add = (a.z - b.z) ^ 2
    }
    return Math.sqrt((a.x - b.x) ^ 2 + (a.y - b.y) ** 2 + add)
}

function dist_arr(a, b) {
    return Math.abs(a - b)
}

const DIST_PAIRS = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [5, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [9, 13],
    [13, 14],
    [14, 15],
    [15, 16],
    [0, 17],
    [13, 17],
    [17, 18],
    [18, 19],
    [19, 20]
]

const angles = [[0, 1], [0, 4], [0, 16], [1, 2], [2, 3], [4, 5], [4, 8], [4, 16], [5, 6], [5, 8], [6, 7], [8, 9], [8, 12], [9, 10], [9, 12], [10, 11], [12, 13], [12, 17], [13, 14], [13, 17], [14, 15], [16, 17], [16, 18], [17, 18], [18, 19], [19, 20]]

function dotproduct(v1, v2) {
    let sum = 0;
    for (var i = 0; i < Math.max(v1.length, v2.length); i++) {
        sum += v1[i] * v2[i];
    }
    return sum
}

function length(v) {
    return Math.sqrt(dotproduct(v, v));
}

function angle(v1, v2) {
    return Math.acos(dotproduct(v1, v2) / (length(v1) * length(v2)));
}

function vec(hand, pair) {
    var a = pair[0];
    var b = pair[1]
    return [hand[b].x - hand[a].x, hand[b].y - hand[a].y, hand[b].z - hand[a].z]
}

function dists(hand) {
    var d = []
    for (const pair of angles) {
        var a = pair[0];
        var b = pair[1];
        const i = DIST_PAIRS[a];
        const j = DIST_PAIRS[b];
        var v1 = vec(hand, i)
        var v2 = vec(hand, j)
        d.push(angle(v1, v2))
    }
    return d
}

function helper(dists, i) {
    var sum = 0
    for (var j = 0; j < i.length; j++) {
        sum += Math.abs(dists[j] - i[j])
    }
    return sum
}

function _classify(dists, hand, l) {
    var min = Number.POSITIVE_INFINITY;
    var min_idx = -1;
    for (var el of l) {
        if (min > helper(dists, el)) {
            min = helper(dists, el);
            min_idx = el
        }
    }
    var s = "abcdefghijklmnopqrstuvwxyz"[l.indexOf(min_idx)]
    if (s == 'y') {
        if (Math.abs(hand[4].x - hand[6].x) < Math.abs(hand[5].x - hand[9].x) * 1.5) {
            s = 'i';
        }
    }
    return s
}

function classify(dists, hand) {
    var x = []
    for (const i of letters) {
        var val = _classify(dists, hand, i)
        x.push(val)
    }
    console.log(x)
    max = Number.NEGATIVE_INFINITY
    var counts = {};
    for (var i = 0; i < x.length; i++) {
        var num = x[i];
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    var max;
    var max_idx;
    Object.keys(counts).forEach(function (key) {
        if (counts[key] > max) {
            max = counts[key]
            max_idx = key
        }
    });
    return max_idx
}

function verify(dists, hand, target, threshold) {
    let a = 0, b = [];
    for (let i of letters) {
        var diff = helper(dists, i[target.charCodeAt(0) - 97]);
        // b.push(diff);
        // a += diff;
        if (diff < threshold) {
            return true;
        }
    }

    // console.log(a, b);
    return false;

    // console.log(a, b, a < threshold);
    // return a < threshold;
    // return diff < threshold;
}


function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    let res = [];
    if (results.multiHandLandmarks) {
        var hand = results.multiHandLandmarks[0]
        // console.log(classify(dists(hand), hand))


        for (let letter of 'abcdefghijklmnopqrstuvwxyz') {
            if (verify(dists(hand), hand, letter, 5)) {
                res.push(letter);
            }
        }
        queue.push(res);
        // console.log(res);
        // console.log(a);
        for (const landmarks of results.multiHandLandmarks) {
            canvasCtx.strokeStyle = '#00FF00';
            canvasCtx.lineWidth = 5;
            for (let i of DIST_PAIRS) {
                // console.log(i);
                let [a, b] = i;
                let l1 = landmarks[a];
                let l2 = landmarks[b];

                // console.log(l1, l2);
                canvasCtx.beginPath();
                canvasCtx.moveTo(l1.x * canvasElement.width, l1.y * canvasElement.height);
                canvasCtx.lineTo(l2.x * canvasElement.width, l2.y * canvasElement.height);
                // console.log(canvasCtx.height, canvasCtx.width);
                canvasCtx.stroke();
            }
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
        }
    }
    // canvasCtx.restore();

    // return res;
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});
hands.setOptions({
    maxNumHands: 2,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    staticImageMode: true
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});
camera.start();

console.log('ASL Initialized!');

export { queue };
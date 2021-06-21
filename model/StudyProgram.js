const StudyProgram = {
    D3_TEKNIK_INFORMATIKA: 1,
    D4_TEKNIK_INFORMATIKA: 2,
    toString: function(studyProgram){
        return studyProgram === StudyProgram.D3_TEKNIK_INFORMATIKA ? 'D3 Teknik Informatika' : 'D4 Teknik Informatika';
    }
};

module.exports = StudyProgram;
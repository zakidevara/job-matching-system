const StudyProgram = {
    D3_TEKNIK_INFORMATIKA: 1,
    D4_TEKNIK_INFORMATIKA: 2,
    toString: function(studyProgram){
        switch(studyProgram){
            case this.D3_TEKNIK_INFORMATIKA:
                return 'D3 Teknik Informatika';
            case this.D4_TEKNIK_INFORMATIKA:
                return 'D4 Teknik Informatika';
            default:
                return 'Tidak ada';
        }
    }
};

module.exports = StudyProgram;
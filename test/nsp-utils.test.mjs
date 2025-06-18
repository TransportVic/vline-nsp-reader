import { expect } from 'chai'
import { getOperationDayLetter, getOperationDays } from '../lib/nsp-utils.mjs'

describe('The NSP Utils module', () => {
  describe('The getOperationDayLetter method', () => {
    it('Should split a list of abbreviated days apart', () => {
      expect(getOperationDayLetter('M')).to.deep.equal([ 'M' ])
      expect(getOperationDayLetter('WTu')).to.deep.equal([ 'W', 'Tu' ])
      expect(getOperationDayLetter('Su')).to.deep.equal([ 'Su' ])
      expect(getOperationDayLetter('WTh')).to.deep.equal([ 'W', 'Th' ])
    })
  })
  describe('The getOperationDays method', () => {
    it('Should return all days for Daily', () => {
      expect(getOperationDays('Daily')).to.deep.equal([ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ])
    })
    it('Should return Monday to Friday for MF', () => {
      expect(getOperationDays('MF')).to.deep.equal([ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri' ])
    })
    it('Should only the specified day if it ends with O', () => {
      expect(getOperationDays('MO')).to.deep.equal([ 'Mon' ])
      expect(getOperationDays('WThO')).to.deep.equal([ 'Wed', 'Thu' ])
      expect(getOperationDays('SuO')).to.deep.equal([ 'Sun' ])
    })
    it('Should exclude days with an E', () => {
      expect(getOperationDays('WThE')).to.deep.equal([ 'Mon', 'Tue', 'Fri', 'Sat', 'Sun' ])
      expect(getOperationDays('FE')).to.deep.equal([ 'Mon', 'Tue', 'Wed', 'Thu', 'Sat', 'Sun' ])
    })
    it('Should join days with a +', () => {
      expect(getOperationDays('Sun+Sat')).to.deep.equal([ 'Sat', 'Sun' ])
      expect(getOperationDays('Sun+MF')).to.deep.equal([ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sun' ])
      expect(getOperationDays('Sun+Sat+ME')).to.deep.equal([ 'Tue', 'Wed', 'Thu', 'Fri', 'Sun' ])
    })
  })
})